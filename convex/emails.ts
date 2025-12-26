/**
 * PropIQ Onboarding Email System
 * Handles transactional emails via SendGrid
 */

import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// SendGrid configuration from environment
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "team@propiq.ai";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@propiq.ai";
const APP_URL = process.env.APP_URL || "https://propiq.luntra.one";

/**
 * Send Day 1 onboarding email
 * Triggered immediately after user signup
 */
export const sendOnboardingDay1 = action({
  args: {
    userId: v.id("users"),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Dynamic import of SendGrid (not available in query/mutation runtime)
    const sgMail = require('@sendgrid/mail');

    if (!SENDGRID_API_KEY) {
      console.error('[ONBOARDING] SendGrid API key not configured');
      return { success: false, error: 'Email service not configured' };
    }

    sgMail.setApiKey(SENDGRID_API_KEY);

    // Personalize email
    const userName = args.name || "there";
    const userEmail = args.email;

    const msg = {
      to: userEmail,
      from: FROM_EMAIL,
      subject: "Day 1 of 4: Welcome to PropIQ",
      html: getDay1EmailHTML(userName, userEmail),
    };

    try {
      await sgMail.send(msg);
      console.log(`[ONBOARDING] Day 1 email sent to ${userEmail}`);

      // Log email sent to database
      await ctx.runMutation(internal.emails.logEmailSent, {
        userId: args.userId,
        emailType: "onboarding_day_1",
        sentAt: Date.now(),
      });

      return { success: true };
    } catch (error: any) {
      console.error(`[ONBOARDING] Failed to send email to ${userEmail}:`, error);
      return { success: false, error: String(error) };
    }
  },
});

/**
 * Internal mutation to log email sends
 */
export const logEmailSent = internalMutation({
  args: {
    userId: v.id("users"),
    emailType: v.string(),
    sentAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailLogs", {
      userId: args.userId,
      emailType: args.emailType,
      sentAt: args.sentAt,
    });
  },
});

/**
 * Day 1 Email Template
 * Adapted from backend/utils/onboarding_emails.py
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
        h2 {
            color: #4F46E5;
            font-size: 20px;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        .intro {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
        }
        .cta-button {
            display: inline-block;
            background-color: #4F46E5;
            color: white;
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
        .feature-card h3 {
            color: #1f2937;
            font-size: 16px;
            margin: 0 0 8px 0;
        }
        .feature-card p {
            color: #6b7280;
            margin: 0;
            font-size: 14px;
        }
        .checklist {
            background: #f9fafb;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .checklist-item {
            padding: 8px 0;
            font-size: 15px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: #6b7280;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            color: #4F46E5;
            text-decoration: none;
            margin-right: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to PropIQ</h1>

        <p class="intro">
            Hi ${userName},
        </p>

        <p class="intro">
            PropIQ is your AI-powered partner for real estate investment analysis, helping you identify
            profitable properties, analyze deals faster, and make data-driven investment decisions with
            confidence. PropIQ transforms every property search into an intelligent, comprehensive analysis,
            making real estate investing work for you.
        </p>

        <a href="${APP_URL}" class="cta-button">Explore PropIQ →</a>

        <h2>Ways PropIQ can help you</h2>

        <div class="feature-card">
            <h3>🏡 AI-Powered Property Analysis</h3>
            <p>Get instant, comprehensive property reports with market insights, cash flow projections,
            and investment recommendations powered by GPT-4.</p>
        </div>

        <div class="feature-card">
            <h3>🧮 Advanced Deal Calculator</h3>
            <p>Run detailed financial scenarios with our 3-tab calculator covering basic metrics,
            advanced analysis, and what-if scenarios with 5-year projections.</p>
        </div>

        <div class="feature-card">
            <h3>📊 Deal Scoring & Insights</h3>
            <p>Every property gets a 0-100 deal score with color-coded ratings, so you can quickly
            identify winners and avoid money pits.</p>
        </div>

        <div class="feature-card">
            <h3>💬 24/7 AI Support Chat</h3>
            <p>Get instant answers to your real estate investing questions with our custom AI support
            assistant that knows PropIQ inside and out.</p>
        </div>

        <a href="${APP_URL}/analyze" class="cta-button">Analyze Your First Property →</a>

        <div class="checklist">
            <h2 style="margin-top: 0;">Quick-start checklist</h2>

            <div class="checklist-item">
                ✅ <strong>1) Complete your profile</strong><br>
                &nbsp;&nbsp;&nbsp;&nbsp;Go to Settings → Profile
            </div>

            <div class="checklist-item">
                ✅ <strong>2) Run your first analysis</strong><br>
                &nbsp;&nbsp;&nbsp;&nbsp;Enter any property address to get started
            </div>

            <div class="checklist-item">
                ✅ <strong>3) Try the Deal Calculator</strong><br>
                &nbsp;&nbsp;&nbsp;&nbsp;Test different scenarios with our advanced calculator
            </div>

            <div class="checklist-item">
                ✅ <strong>4) Explore pricing plans</strong><br>
                &nbsp;&nbsp;&nbsp;&nbsp;Go to Pricing → Choose your plan
            </div>
        </div>

        <h2>Helpful information</h2>

        <p><strong>Your data and privacy</strong><br>
        To see how we protect your data, visit our <a href="${APP_URL}/privacy" style="color: #4F46E5;">privacy page</a>.</p>

        <p><strong>Share your feedback</strong><br>
        Use our support chat or email us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #4F46E5;">${SUPPORT_EMAIL}</a></p>

        <div class="social-links">
            <strong>Follow along for PropIQ tips & updates</strong><br>
            <a href="https://twitter.com/propiq">Twitter</a>
            <a href="https://linkedin.com/company/propiq">LinkedIn</a>
        </div>

        <div class="footer">
            <p>© 2025 PropIQ by LUNTRA. Making real estate investing smarter.</p>
            <p>
                <a href="${APP_URL}/unsubscribe?email=${userEmail}" style="color: #6b7280;">Unsubscribe</a> |
                <a href="${APP_URL}/privacy" style="color: #6b7280;">Privacy Policy</a> |
                <a href="${APP_URL}/terms" style="color: #6b7280;">Terms and Conditions</a>
            </p>
        </div>
    </div>
</body>
</html>
  `;
}
