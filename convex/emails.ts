/**
 * Email integration for PropIQ
 * Handles onboarding emails via Resend
 */

import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Resend configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "onboarding@resend.dev"; // Resend sandbox domain
const APP_URL = "https://propiq.luntra.one";

/**
 * Send Day 1 onboarding email
 * Triggered immediately after user signup
 */
export const sendOnboardingDay1 = action({
  args: {
    userId: v.id("users"),
    email: v.string(),
    firstName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!RESEND_API_KEY) {
      console.error("[EMAIL] Resend API key not configured");
      return { success: false, error: "Email service not configured" };
    }

    const userName = args.firstName || "there";

    // Build email HTML
    const html = getDay1EmailHTML(userName, args.email);

    try {
      // Send email via Resend API
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: args.email,
          subject: "Welcome to PropIQ - Day 1 of 4",
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`[EMAIL] Failed to send to ${args.email}:`, error);
        return { success: false, error };
      }

      const result = await response.json();
      console.log(`[EMAIL] ✅ Day 1 email sent to ${args.email} (ID: ${result.id})`);

      // Log email send to database
      await ctx.runMutation(internal.emails.logEmailSent, {
        userId: args.userId,
        emailType: "onboarding_day_1",
        sentAt: Date.now(),
        resendId: result.id,
      });

      return { success: true, emailId: result.id };
    } catch (error) {
      console.error(`[EMAIL] ❌ Error sending to ${args.email}:`, error);
      return { success: false, error: String(error) };
    }
  },
});

/**
 * Internal mutation to log email send
 */
export const logEmailSent = internalMutation({
  args: {
    userId: v.id("users"),
    emailType: v.string(),
    sentAt: v.number(),
    resendId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailLogs", {
      userId: args.userId,
      emailType: args.emailType,
      sentAt: args.sentAt,
      resendId: args.resendId,
      opened: false,
      clicked: false,
    });
  },
});

/**
 * Day 1 email template
 */
function getDay1EmailHTML(userName: string, userEmail: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        h1 {
            color: #4F46E5;
            font-size: 28px;
            margin-bottom: 20px;
        }
        .cta-button {
            display: inline-block;
            background-color: #4F46E5;
            color: white !important;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .feature-card {
            background: #f3f4f6;
            border-left: 4px solid #4F46E5;
            padding: 16px;
            margin: 16px 0;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to PropIQ! 🏡</h1>

        <p>Hi ${userName},</p>

        <p>Welcome to PropIQ, your AI-powered partner for real estate investment analysis. We're excited to have you on board!</p>

        <p><strong>Your free trial includes 3 AI-powered property analyses.</strong> Let's make the most of them!</p>

        <a href="${APP_URL}" class="cta-button">Analyze Your First Property →</a>

        <h2 style="color: #1f2937; font-size: 20px; margin-top: 32px;">Quick Start Guide</h2>

        <div class="feature-card">
            <strong>📍 Step 1: Enter an Address</strong><br>
            Type any US property address into the search bar
        </div>

        <div class="feature-card">
            <strong>🤖 Step 2: Get AI Analysis</strong><br>
            Our AI analyzes market data, comps, and investment potential
        </div>

        <div class="feature-card">
            <strong>📊 Step 3: Review Insights</strong><br>
            Get deal scores, cash flow projections, and actionable recommendations
        </div>

        <h2 style="color: #1f2937; font-size: 20px; margin-top: 32px;">What PropIQ Can Do</h2>

        <ul>
            <li><strong>Market Analysis:</strong> Neighborhood trends, comps, and pricing insights</li>
            <li><strong>Investment Metrics:</strong> Cap rate, cash-on-cash return, 1% rule compliance</li>
            <li><strong>Deal Scoring:</strong> 0-100 rating with color-coded recommendations</li>
            <li><strong>Risk Assessment:</strong> Identify potential issues before you invest</li>
        </ul>

        <p style="margin-top: 32px;"><strong>Need help?</strong> Reply to this email or click the Help button in the app. We're here for you!</p>

        <p>Happy analyzing!<br>
        The PropIQ Team</p>

        <div class="footer">
            <p>© 2025 PropIQ by LUNTRA<br>
            <a href="${APP_URL}" style="color: #4F46E5;">propiq.luntra.one</a></p>
            <p style="font-size: 12px; color: #9ca3af;">
                You're receiving this because you signed up for PropIQ.<br>
                Questions? Reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}
