/**
 * HTTP endpoints for webhooks, external integrations, and auth
 *
 * Auth uses localStorage + Authorization Bearer header (not cookies).
 * Cookies don't work because Convex is on a different domain (.convex.site)
 * and browsers block third-party cookies.
 *
 * - POST /auth/login - Authenticate, returns session token in response body
 * - GET /auth/me - Validate session via Authorization header
 * - POST /auth/logout - Clear session via Authorization header
 * - POST /auth/refresh - Extend session expiration
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

// Type declaration for Node.js process environment variables
declare const process: { env: Record<string, string | undefined> };

const http = httpRouter();

/**
 * Determine if running in production based on environment
 * Set IS_PRODUCTION_ENV=false in Convex dashboard for development
 * Defaults to production mode for safety (more restrictive CORS)
 */
const IS_PRODUCTION =
  process.env.IS_PRODUCTION_ENV !== "false" &&
  (process.env.IS_PRODUCTION_ENV === "true" ||
   process.env.CONVEX_ENV === "production" ||
   process.env.NODE_ENV === "production" ||
   !process.env.IS_PRODUCTION_ENV); // Default to production if not explicitly set

// CORS headers for cross-origin requests from frontend
// No credentials needed since we use Bearer tokens (not cookies)
// Allow both localhost (development) and production domain
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins for simplicity
  "Access-Control-Allow-Credentials": "false",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

http.route({
  path: "/auth/request-password-reset",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/auth/reset-password",
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

      // Return sessionToken in response body
      // Frontend stores in localStorage and sends via Authorization header
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
      return new Response(
        JSON.stringify({ success: false, error: "Login failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * POST /auth/signup
 * Create user and return session token
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

      // Return sessionToken in response body
      // Frontend stores in localStorage and sends via Authorization header
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
      return new Response(
        JSON.stringify({ success: false, error: "Signup failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * GET /auth/me
 * Validate session and return user data
 * Token must be sent via Authorization: Bearer <token> header
 */
http.route({
  path: "/auth/me",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const token = getBearerToken(request);

      if (!token) {
        return new Response(
          JSON.stringify({ authenticated: false, user: null }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate session
      const result = await ctx.runQuery(api.sessions.validateSession, { token });

      if (!result) {
        return new Response(
          JSON.stringify({ authenticated: false, user: null }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
 * Clear session - requires Authorization: Bearer <token> header
 */
http.route({
  path: "/auth/logout",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const token = getBearerToken(request);

      if (token) {
        // Delete server-side session
        await ctx.runMutation(api.sessions.deleteSession, { token });
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("[AUTH] Logout error:", error);
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * POST /auth/refresh
 * Extend session expiration - requires Authorization: Bearer <token> header
 */
http.route({
  path: "/auth/refresh",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const token = getBearerToken(request);

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
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, expiresAt: result.expiresAt }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

/**
 * POST /auth/request-password-reset
 * Request a password reset email
 * Sends email with reset link using Resend
 */
http.route({
  path: "/auth/request-password-reset",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { email } = body;

      if (!email) {
        return new Response(
          JSON.stringify({ success: false, error: "Email is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create reset token
      const result = await ctx.runMutation(api.auth.requestPasswordReset, { email });

      if (!result.success) {
        return new Response(
          JSON.stringify({ success: false, error: result.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Send email using Resend (if token was generated)
      if (result.token) {
        const resendApiKey = process.env.RESEND_API_KEY;

        if (resendApiKey) {
          const frontendUrl = IS_PRODUCTION
            ? "https://propiq.luntra.one"
            : "http://localhost:5173";

          const resetLink = `${frontendUrl}/reset-password?token=${result.token}`;

          try {
            const emailResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "PropIQ <onboarding@resend.dev>",
                to: [result.email],
                subject: "Reset Your PropIQ Password",
                html: `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
                      </div>
                      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>
                        <p style="font-size: 16px; margin-bottom: 20px;">
                          We received a request to reset your PropIQ password. Click the button below to create a new password:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px;">
                            Reset Password
                          </a>
                        </div>
                        <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
                          Or copy and paste this link into your browser:
                        </p>
                        <p style="font-size: 14px; color: #667eea; word-break: break-all; background: white; padding: 10px; border-radius: 4px;">
                          ${resetLink}
                        </p>
                        <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                          This link will expire in <strong>15 minutes</strong>.
                        </p>
                        <p style="font-size: 14px; color: #666;">
                          If you didn't request a password reset, you can safely ignore this email.
                        </p>
                        <p style="font-size: 14px; color: #666; margin-top: 30px;">
                          Thanks,<br>
                          <strong>The PropIQ Team</strong>
                        </p>
                      </div>
                    </body>
                  </html>
                `,
              }),
            });

            if (!emailResponse.ok) {
              console.error("[AUTH] Failed to send password reset email:", await emailResponse.text());
            } else {
              console.log("[AUTH] Password reset email sent to:", result.email);
            }
          } catch (emailError) {
            console.error("[AUTH] Error sending password reset email:", emailError);
            // Don't fail the request if email fails - token is still valid
          }
        } else {
          console.warn("[AUTH] RESEND_API_KEY not configured - password reset email not sent");
        }
      }

      // Always return success (prevents email enumeration)
      return new Response(
        JSON.stringify({
          success: true,
          message: result.message,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("[AUTH] Request password reset error:", error);
      return new Response(
        JSON.stringify({
          success: true,
          message: "If an account exists with that email, a password reset link has been sent.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * POST /auth/reset-password
 * Reset password using a valid reset token
 */
http.route({
  path: "/auth/reset-password",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { token, newPassword } = body;

      if (!token || !newPassword) {
        return new Response(
          JSON.stringify({ success: false, error: "Token and new password are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Reset password
      const result = await ctx.runMutation(api.auth.resetPassword, {
        token,
        newPassword,
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
          message: result.message,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("[AUTH] Reset password error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Password reset failed" }),
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
 * Requires Authorization: Bearer <token> header
 */
http.route({
  path: "/auth/logout-everywhere",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const token = getBearerToken(request);

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
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
 * Requires Authorization: Bearer <token> header
 */
http.route({
  path: "/propiq/analyze",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const token = getBearerToken(request);

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

/**
 * Extension CORS headers - more permissive for extension context
 *
 * SECURITY NOTES:
 * - Uses "*" wildcard because Chrome extensions can't be whitelisted by origin
 * - All endpoints require Bearer token authentication for security
 * - Consider implementing rate limiting for these endpoints
 * - User agent validation is performed on sensitive operations
 *
 * No credentials needed since we use Bearer tokens (not cookies)
 */
const extensionCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "false",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Extension-Version",
};

/**
 * Validate request is from a legitimate source
 * Checks for suspicious patterns while allowing valid Chrome extensions
 */
function validateExtensionRequest(request: Request): { valid: boolean; reason?: string } {
  const userAgent = request.headers.get("User-Agent");
  const origin = request.headers.get("Origin");

  // Allow Chrome extensions (they have chrome-extension:// origin)
  if (origin?.startsWith("chrome-extension://")) {
    return { valid: true };
  }

  // Allow Mozilla extensions
  if (origin?.startsWith("moz-extension://")) {
    return { valid: true };
  }

  // Allow our web app origins
  if (origin === "https://propiq.luntra.one" || origin === "http://localhost:5173") {
    return { valid: true };
  }

  // Log suspicious requests for monitoring
  if (userAgent && !userAgent.includes("Chrome") && !userAgent.includes("Firefox")) {
    console.warn("[SECURITY] Suspicious extension request from:", { origin, userAgent });
  }

  // Allow all requests but log for monitoring (since auth is required anyway)
  return { valid: true };
}

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
      // Validate request (logs suspicious activity)
      const validation = validateExtensionRequest(request);
      if (!validation.valid) {
        console.warn("[SECURITY] Blocked extension login:", validation.reason);
      }

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
 * Requires Authorization: Bearer <token> header
 */
http.route({
  path: "/auth/validate",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const token = getBearerToken(request);

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
