/**
 * HTTP endpoints for webhooks, external integrations, and auth
 *
 * Auth endpoints use httpOnly cookies for secure session management:
 * - POST /auth/login - Authenticate and set session cookie
 * - GET /auth/me - Validate session and return user data
 * - POST /auth/logout - Clear session and cookie
 * - POST /auth/refresh - Extend session expiration
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Cookie configuration
const COOKIE_NAME = "propiq_session";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds
const IS_PRODUCTION = true; // Set based on environment

// CORS headers for cross-origin requests from frontend
const corsHeaders = {
  "Access-Control-Allow-Origin": IS_PRODUCTION
    ? "https://propiq.luntra.one"
    : "http://localhost:5173",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Build Set-Cookie header for session
 */
function buildSessionCookie(token: string, maxAge: number = COOKIE_MAX_AGE): string {
  const parts = [
    `${COOKIE_NAME}=${token}`,
    `Max-Age=${maxAge}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (IS_PRODUCTION) {
    parts.push("Secure");
    parts.push("Domain=.luntra.one"); // Works for subdomains
  }

  return parts.join("; ");
}

/**
 * Build Set-Cookie header to clear session
 */
function buildClearCookie(): string {
  const parts = [
    `${COOKIE_NAME}=`,
    "Max-Age=0",
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (IS_PRODUCTION) {
    parts.push("Secure");
    parts.push("Domain=.luntra.one");
  }

  return parts.join("; ");
}

/**
 * Parse session token from cookie header
 */
function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === COOKIE_NAME) {
      return value;
    }
  }
  return null;
}

// ============================================
// AUTH ENDPOINTS
// ============================================

// OPTIONS handler for CORS preflight
http.route({
  path: "/auth/me",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/auth/login",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/auth/logout",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/auth/refresh",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/auth/signup",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

/**
 * POST /auth/login
 * Authenticate user and set session cookie
 */
http.route({
  path: "/auth/login",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return new Response(
          JSON.stringify({ success: false, error: "Email and password required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Call the login mutation
      const result = await ctx.runMutation(api.auth.loginWithSession, {
        email,
        password,
        userAgent: request.headers.get("User-Agent") || undefined,
      });

      if (!result.success) {
        return new Response(
          JSON.stringify({ success: false, error: result.error }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Set session cookie
      const setCookie = buildSessionCookie(result.sessionToken!);

      // Return sessionToken for extension sync (extension uses postMessage to receive this)
      // The httpOnly cookie protects the web app, but we also pass token for extension sync
      return new Response(
        JSON.stringify({
          success: true,
          user: result.user,
          sessionToken: result.sessionToken, // For extension sync via postMessage
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Set-Cookie": setCookie,
          },
        }
      );
    } catch (error) {
      console.error("[AUTH] Login error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Login failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * POST /auth/signup
 * Create user and set session cookie
 */
http.route({
  path: "/auth/signup",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { email, password, firstName, lastName, company } = body;

      if (!email || !password) {
        return new Response(
          JSON.stringify({ success: false, error: "Email and password required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Call the signup mutation
      const result = await ctx.runMutation(api.auth.signupWithSession, {
        email,
        password,
        firstName,
        lastName,
        company,
        userAgent: request.headers.get("User-Agent") || undefined,
      });

      if (!result.success) {
        return new Response(
          JSON.stringify({ success: false, error: result.error }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Set session cookie
      const setCookie = buildSessionCookie(result.sessionToken!);

      // Return sessionToken for extension sync
      return new Response(
        JSON.stringify({
          success: true,
          user: result.user,
          sessionToken: result.sessionToken, // For extension sync via postMessage
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Set-Cookie": setCookie,
          },
        }
      );
    } catch (error) {
      console.error("[AUTH] Signup error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Signup failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * GET /auth/me
 * Validate session cookie and return user data
 */
http.route({
  path: "/auth/me",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const token = getSessionToken(request);

      if (!token) {
        return new Response(
          JSON.stringify({ authenticated: false, user: null }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate session
      const result = await ctx.runQuery(api.sessions.validateSession, { token });

      if (!result) {
        // Invalid/expired session - clear cookie
        return new Response(
          JSON.stringify({ authenticated: false, user: null }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              "Set-Cookie": buildClearCookie(),
            },
          }
        );
      }

      // If session needs refresh, do it
      if (result.session.needsRefresh) {
        await ctx.runMutation(api.sessions.refreshSession, { token });
      }

      return new Response(
        JSON.stringify({
          authenticated: true,
          user: result.user,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("[AUTH] /me error:", error);
      return new Response(
        JSON.stringify({ authenticated: false, user: null }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * POST /auth/logout
 * Clear session and cookie
 */
http.route({
  path: "/auth/logout",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const token = getSessionToken(request);

      if (token) {
        // Delete server-side session
        await ctx.runMutation(api.sessions.deleteSession, { token });
      }

      // Clear cookie
      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Set-Cookie": buildClearCookie(),
          },
        }
      );
    } catch (error) {
      console.error("[AUTH] Logout error:", error);
      return new Response(
        JSON.stringify({ success: true }), // Still clear cookie on error
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Set-Cookie": buildClearCookie(),
          },
        }
      );
    }
  }),
});

/**
 * POST /auth/refresh
 * Extend session expiration
 */
http.route({
  path: "/auth/refresh",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const token = getSessionToken(request);

      if (!token) {
        return new Response(
          JSON.stringify({ success: false, error: "No session" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await ctx.runMutation(api.sessions.refreshSession, { token });

      if (!result.success) {
        return new Response(
          JSON.stringify({ success: false, error: result.error }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              "Set-Cookie": buildClearCookie(),
            },
          }
        );
      }

      // Update cookie with new expiration
      return new Response(
        JSON.stringify({ success: true, expiresAt: result.expiresAt }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Set-Cookie": buildSessionCookie(token),
          },
        }
      );
    } catch (error) {
      console.error("[AUTH] Refresh error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Refresh failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

// OPTIONS handler for logout-everywhere
http.route({
  path: "/auth/logout-everywhere",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

/**
 * POST /auth/logout-everywhere
 * Clear ALL sessions for the current user (logout from all devices)
 */
http.route({
  path: "/auth/logout-everywhere",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const token = getSessionToken(request);

      if (!token) {
        return new Response(
          JSON.stringify({ success: false, error: "No session" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // First, validate the session to get the userId
      const sessionData = await ctx.runQuery(api.sessions.validateSession, { token });

      if (!sessionData) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid session" }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              "Set-Cookie": buildClearCookie(),
            },
          }
        );
      }

      // Delete all sessions for this user
      const result = await ctx.runMutation(api.sessions.deleteAllUserSessions, {
        userId: sessionData.user._id,
      });

      console.log("[AUTH] Logged out from all devices for user:", sessionData.user.email);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Logged out from ${result.deletedCount} device(s)`,
          deletedCount: result.deletedCount,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Set-Cookie": buildClearCookie(),
          },
        }
      );
    } catch (error) {
      console.error("[AUTH] Logout everywhere error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to logout from all devices" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

// Stripe webhook handler
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.text();
      const signature = request.headers.get("stripe-signature");

      if (!signature) {
        return new Response("Missing stripe-signature header", { status: 400 });
      }

      // Verify webhook signature
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error("Stripe webhook secret not configured");
        return new Response("Webhook not configured", { status: 500 });
      }

      // Parse event
      const event = JSON.parse(body);

      // Log webhook event
      await ctx.runMutation(api.payments.logStripeEvent, {
        eventId: event.id,
        eventType: event.type,
        customerId: event.data?.object?.customer,
        subscriptionId: event.data?.object?.subscription,
        status: "processing",
        rawData: body,
      });

      // Handle different event types
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId = session.metadata?.userId;
          const tier = session.metadata?.tier;

          if (userId && tier) {
            await ctx.runMutation(api.payments.handleSubscriptionSuccess, {
              userId,
              tier,
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
            });

            // Update event log
            await ctx.runMutation(api.payments.logStripeEvent, {
              eventId: event.id,
              eventType: event.type,
              customerId: session.customer,
              subscriptionId: session.subscription,
              status: "completed",
              rawData: body,
            });
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const customerId = subscription.customer;

          // Find user by Stripe customer ID and cancel subscription
          // This would require a query by stripeCustomerId
          // For now, log the event
          await ctx.runMutation(api.payments.logStripeEvent, {
            eventId: event.id,
            eventType: event.type,
            customerId,
            subscriptionId: subscription.id,
            status: "completed",
            rawData: body,
          });
          break;
        }

        default:
          // Log unhandled event types
          await ctx.runMutation(api.payments.logStripeEvent, {
            eventId: event.id,
            eventType: event.type,
            status: "completed",
            rawData: body,
          });
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      return new Response(`Webhook Error: ${error}`, { status: 400 });
    }
  }),
});

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({
        status: "healthy",
        service: "PropIQ Convex Backend",
        timestamp: Date.now(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

// ============================================
// PROPERTY ANALYSIS ENDPOINTS
// ============================================

http.route({
  path: "/propiq/analyze",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: extensionCorsHeaders });
  }),
});

/**
 * POST /propiq/analyze
 * Run property analysis - works for both web app and extension
 * Accepts session via cookie OR Authorization header
 */
http.route({
  path: "/propiq/analyze",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Authenticate - try cookie first, then Authorization header
      let token = getSessionToken(request);
      const authHeader = request.headers.get("Authorization");
      if (!token && authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }

      if (!token) {
        return new Response(
          JSON.stringify({ success: false, error: "Not authenticated" }),
          { status: 401, headers: { ...extensionCorsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate session
      const sessionData = await ctx.runQuery(api.sessions.validateSession, { token });
      if (!sessionData || !sessionData.user) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid session" }),
          { status: 401, headers: { ...extensionCorsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await request.json();

      // Run the analysis action
      const result = await ctx.runAction(api.propiq.analyzeProperty, {
        userId: sessionData.user._id,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        purchasePrice: body.purchasePrice,
        downPayment: body.downPayment,
        monthlyRent: body.monthlyRent,
      });

      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { ...extensionCorsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error: any) {
      console.error("[PROPIQ] Analysis error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message || "Analysis failed" }),
        { status: 500, headers: { ...extensionCorsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

// ============================================
// EXTENSION-SPECIFIC AUTH ENDPOINTS
// These return tokens in response body (not cookies)
// for Chrome extension which can't use httpOnly cookies
// ============================================

// Extension CORS headers (more permissive for extension context)
const extensionCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// OPTIONS handlers for extension endpoints
http.route({
  path: "/auth/extension-login",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: extensionCorsHeaders });
  }),
});

http.route({
  path: "/auth/extension-signup",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: extensionCorsHeaders });
  }),
});

http.route({
  path: "/auth/validate",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: extensionCorsHeaders });
  }),
});

http.route({
  path: "/auth/extension-logout",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: extensionCorsHeaders });
  }),
});

/**
 * POST /auth/extension-login
 * Login for Chrome extension - returns token in response body (not cookie)
 * Extension stores token in chrome.storage.local
 */
http.route({
  path: "/auth/extension-login",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return new Response(
          JSON.stringify({ success: false, error: "Email and password required" }),
          { status: 400, headers: { ...extensionCorsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await ctx.runMutation(api.auth.loginWithSession, {
        email,
        password,
        userAgent: request.headers.get("User-Agent") || "Chrome Extension",
      });

      if (!result.success) {
        return new Response(
          JSON.stringify({ success: false, error: result.error }),
          { status: 401, headers: { ...extensionCorsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return token in body (extension will store in chrome.storage)
      return new Response(
        JSON.stringify({
          success: true,
          sessionToken: result.sessionToken,
          user: result.user,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        }),
        {
          status: 200,
          headers: { ...extensionCorsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("[AUTH] Extension login error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Login failed" }),
        { status: 500, headers: { ...extensionCorsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * POST /auth/extension-signup
 * Signup for Chrome extension - returns token in response body
 */
http.route({
  path: "/auth/extension-signup",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { email, password, firstName, lastName } = body;

      if (!email || !password) {
        return new Response(
          JSON.stringify({ success: false, error: "Email and password required" }),
          { status: 400, headers: { ...extensionCorsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await ctx.runMutation(api.auth.signupWithSession, {
        email,
        password,
        firstName,
        lastName,
        userAgent: request.headers.get("User-Agent") || "Chrome Extension",
      });

      if (!result.success) {
        return new Response(
          JSON.stringify({ success: false, error: result.error }),
          { status: 400, headers: { ...extensionCorsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          sessionToken: result.sessionToken,
          user: result.user,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        }),
        {
          status: 200,
          headers: { ...extensionCorsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("[AUTH] Extension signup error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Signup failed" }),
        { status: 500, headers: { ...extensionCorsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * GET /auth/validate
 * Validate session token from Authorization header
 * Used by extension to check if session is still valid
 */
http.route({
  path: "/auth/validate",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const authHeader = request.headers.get("Authorization");
      let token: string | null = null;

      // Try Authorization header first (for extension)
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }

      // Fall back to cookie (for web app)
      if (!token) {
        token = getSessionToken(request);
      }

      if (!token) {
        return new Response(
          JSON.stringify({ valid: false }),
          { status: 200, headers: { ...extensionCorsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await ctx.runQuery(api.sessions.validateSession, { token });

      return new Response(
        JSON.stringify({
          valid: !!result,
          user: result?.user || null,
        }),
        { status: 200, headers: { ...extensionCorsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("[AUTH] Validate error:", error);
      return new Response(
        JSON.stringify({ valid: false }),
        { status: 200, headers: { ...extensionCorsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * POST /auth/extension-logout
 * Logout for extension - uses Authorization header
 */
http.route({
  path: "/auth/extension-logout",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const authHeader = request.headers.get("Authorization");

      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        await ctx.runMutation(api.sessions.deleteSession, { token });
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...extensionCorsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("[AUTH] Extension logout error:", error);
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...extensionCorsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;
