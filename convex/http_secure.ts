/**
 * SECURE HTTP endpoints with rate limiting, CORS hardening, and security headers
 *
 * This file shows the secure version of your HTTP endpoints.
 * Review the changes and apply to your existing convex/http.ts
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

// Type declaration for Node.js process environment variables
declare const process: { env: Record<string, string | undefined> };

const http = httpRouter();

// ============================================
// SECURE CONFIGURATION
// ============================================

/**
 * PRODUCTION-READY CORS Configuration
 * - Whitelist specific origins (NOT wildcard *)
 * - Only allow necessary methods
 * - Strict header control
 */
const ALLOWED_ORIGINS = [
  "https://propiq.luntra.one",
  "https://www.propiq.luntra.one",
  // Development (only if not in production)
  ...(process.env.NODE_ENV !== "production"
    ? ["http://localhost:5173", "http://localhost:3000"]
    : []
  ),
];

/**
 * Get CORS headers with origin validation
 */
function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Credentials": "false",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400", // 24 hours
    // Security headers
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  };
}

/**
 * Extract client IP address from request
 * Used for rate limiting
 */
function getClientIp(request: Request): string {
  // Check common headers for real IP
  const forwardedFor = request.headers.get("X-Forwarded-For");
  const realIp = request.headers.get("X-Real-IP");
  const cfConnectingIp = request.headers.get("CF-Connecting-IP");

  return cfConnectingIp || realIp || forwardedFor?.split(",")[0] || "unknown";
}

/**
 * Extract Bearer token from Authorization header
 */
function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

// ============================================
// AUTH ENDPOINTS WITH RATE LIMITING
// ============================================

/**
 * POST /auth/login
 * Authenticate user with rate limiting protection
 */
http.route({
  path: "/auth/login",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const corsHeaders = getCorsHeaders(request);
    const clientIp = getClientIp(request);

    try {
      // STEP 1: Check rate limit BEFORE processing login
      const rateLimit = await ctx.runQuery(api.rateLimit.checkRateLimit, {
        identifier: clientIp,
        action: "login",
      });

      if (!rateLimit.allowed) {
        const resetDate = new Date(rateLimit.resetAt).toISOString();
        return new Response(
          JSON.stringify({
            success: false,
            error: `Too many login attempts. Please try again after ${resetDate}`,
            retryAfter: rateLimit.resetAt,
          }),
          {
            status: 429, // Too Many Requests
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
            },
          }
        );
      }

      // STEP 2: Parse and validate request
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        // Record failed attempt
        await ctx.runMutation(api.rateLimit.recordAttempt, {
          identifier: clientIp,
          action: "login",
          success: false,
        });

        return new Response(
          JSON.stringify({ success: false, error: "Email and password required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // STEP 3: Attempt login
      const result = await ctx.runMutation(api.auth.loginWithSession, {
        email,
        password,
        userAgent: request.headers.get("User-Agent") || undefined,
      });

      // STEP 4: Record attempt result
      await ctx.runMutation(api.rateLimit.recordAttempt, {
        identifier: clientIp,
        action: "login",
        success: result.success,
      });

      if (!result.success) {
        return new Response(
          JSON.stringify({ success: false, error: result.error || "Invalid credentials" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // STEP 5: Successful login
      return new Response(
        JSON.stringify({
          success: true,
          user: result.user,
          sessionToken: result.sessionToken,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("[AUTH] Login error:", error);

      // Record failed attempt
      await ctx.runMutation(api.rateLimit.recordAttempt, {
        identifier: clientIp,
        action: "login",
        success: false,
      });

      return new Response(
        JSON.stringify({ success: false, error: "Login failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * POST /auth/signup
 * Create user with rate limiting
 */
http.route({
  path: "/auth/signup",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const corsHeaders = getCorsHeaders(request);
    const clientIp = getClientIp(request);

    try {
      // Check rate limit
      const rateLimit = await ctx.runQuery(api.rateLimit.checkRateLimit, {
        identifier: clientIp,
        action: "signup",
      });

      if (!rateLimit.allowed) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Too many signup attempts. Please try again later.",
            retryAfter: rateLimit.resetAt,
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
            },
          }
        );
      }

      const body = await request.json();
      const { email, password, firstName, lastName, company, referralCode } = body;

      if (!email || !password) {
        await ctx.runMutation(api.rateLimit.recordAttempt, {
          identifier: clientIp,
          action: "signup",
          success: false,
        });

        return new Response(
          JSON.stringify({ success: false, error: "Email and password required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await ctx.runMutation(api.auth.signupWithSession, {
        email,
        password,
        firstName,
        lastName,
        company,
        referralCode,
        userAgent: request.headers.get("User-Agent") || undefined,
      });

      await ctx.runMutation(api.rateLimit.recordAttempt, {
        identifier: clientIp,
        action: "signup",
        success: result.success,
      });

      if (!result.success) {
        return new Response(
          JSON.stringify({ success: false, error: result.error }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          user: result.user,
          sessionToken: result.sessionToken,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("[AUTH] Signup error:", error);

      await ctx.runMutation(api.rateLimit.recordAttempt, {
        identifier: clientIp,
        action: "signup",
        success: false,
      });

      return new Response(
        JSON.stringify({ success: false, error: "Signup failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * POST /auth/request-password-reset
 * Request password reset with rate limiting
 */
http.route({
  path: "/auth/request-password-reset",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const corsHeaders = getCorsHeaders(request);
    const clientIp = getClientIp(request);

    try {
      // Check rate limit
      const rateLimit = await ctx.runQuery(api.rateLimit.checkRateLimit, {
        identifier: clientIp,
        action: "passwordReset",
      });

      if (!rateLimit.allowed) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Too many password reset requests. Please try again later.",
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const body = await request.json();
      const { email } = body;

      if (!email) {
        return new Response(
          JSON.stringify({ success: false, error: "Email required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Process password reset request
      const result = await ctx.runMutation(api.auth.requestPasswordReset, { email });

      // Always record attempt (prevents enumeration)
      await ctx.runMutation(api.rateLimit.recordAttempt, {
        identifier: clientIp,
        action: "passwordReset",
        success: true,
      });

      // Always return success (prevents email enumeration)
      return new Response(
        JSON.stringify({
          success: true,
          message: "If an account exists with that email, a password reset link has been sent.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("[AUTH] Password reset error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Request failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

// ============================================
// OPTIONS HANDLERS (CORS Preflight)
// ============================================

http.route({
  path: "/auth/login",
  method: "OPTIONS",
  handler: httpAction(async (ctx, request) => {
    const corsHeaders = getCorsHeaders(request);
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/auth/signup",
  method: "OPTIONS",
  handler: httpAction(async (ctx, request) => {
    const corsHeaders = getCorsHeaders(request);
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/auth/request-password-reset",
  method: "OPTIONS",
  handler: httpAction(async (ctx, request) => {
    const corsHeaders = getCorsHeaders(request);
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

export default http;

// ============================================
// IMPLEMENTATION NOTES
// ============================================
//
// To apply these changes to your existing convex/http.ts:
//
// 1. Copy the getCorsHeaders() function and update ALLOWED_ORIGINS
// 2. Copy the getClientIp() function
// 3. Update each auth endpoint to:
//    - Check rate limits before processing
//    - Record attempts after processing
//    - Use getCorsHeaders() for CORS
// 4. Add rate limiting to other sensitive endpoints
// 5. Test thoroughly in development before deploying
//
// ============================================
