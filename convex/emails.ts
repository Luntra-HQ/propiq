/**
 * Email integration for PropIQ
 * Handles onboarding emails via Resend
 */

import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Resend configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "PropIQ <hello@propiq.luntra.one>"; // Verified domain via Cloudflare
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
 * Send Day 2 onboarding email
 * Feature deep-dive email
 */
export const sendOnboardingDay2 = action({
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
    const html = getDay2EmailHTML(userName);

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: args.email,
          subject: "3 ways PropIQ finds deals others miss",
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`[EMAIL] Failed to send Day 2 to ${args.email}:`, error);
        return { success: false, error };
      }

      const result = await response.json();
      console.log(`[EMAIL] ✅ Day 2 email sent to ${args.email} (ID: ${result.id})`);

      await ctx.runMutation(internal.emails.logEmailSent, {
        userId: args.userId,
        emailType: "onboarding_day_2",
        sentAt: Date.now(),
        resendId: result.id,
      });

      return { success: true, emailId: result.id };
    } catch (error) {
      console.error(`[EMAIL] ❌ Error sending Day 2 to ${args.email}:`, error);
      return { success: false, error: String(error) };
    }
  },
});

/**
 * Send Day 3 onboarding email
 * Social proof and use cases
 */
export const sendOnboardingDay3 = action({
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
    const html = getDay3EmailHTML(userName);

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: args.email,
          subject: "How investors are using PropIQ",
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`[EMAIL] Failed to send Day 3 to ${args.email}:`, error);
        return { success: false, error };
      }

      const result = await response.json();
      console.log(`[EMAIL] ✅ Day 3 email sent to ${args.email} (ID: ${result.id})`);

      await ctx.runMutation(internal.emails.logEmailSent, {
        userId: args.userId,
        emailType: "onboarding_day_3",
        sentAt: Date.now(),
        resendId: result.id,
      });

      return { success: true, emailId: result.id };
    } catch (error) {
      console.error(`[EMAIL] ❌ Error sending Day 3 to ${args.email}:`, error);
      return { success: false, error: String(error) };
    }
  },
});

/**
 * Send Day 4 onboarding email
 * Upgrade prompt
 */
export const sendOnboardingDay4 = action({
  args: {
    userId: v.id("users"),
    email: v.string(),
    firstName: v.optional(v.string()),
    analysesRemaining: v.number(),
  },
  handler: async (ctx, args) => {
    if (!RESEND_API_KEY) {
      console.error("[EMAIL] Resend API key not configured");
      return { success: false, error: "Email service not configured" };
    }

    const userName = args.firstName || "there";
    const html = getDay4EmailHTML(userName, args.analysesRemaining);

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: args.email,
          subject: "Your free analyses are waiting",
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`[EMAIL] Failed to send Day 4 to ${args.email}:`, error);
        return { success: false, error };
      }

      const result = await response.json();
      console.log(`[EMAIL] ✅ Day 4 email sent to ${args.email} (ID: ${result.id})`);

      await ctx.runMutation(internal.emails.logEmailSent, {
        userId: args.userId,
        emailType: "onboarding_day_4",
        sentAt: Date.now(),
        resendId: result.id,
      });

      return { success: true, emailId: result.id };
    } catch (error) {
      console.error(`[EMAIL] ❌ Error sending Day 4 to ${args.email}:`, error);
      return { success: false, error: String(error) };
    }
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

/**
 * Day 2 email template - Feature deep-dive
 */
function getDay2EmailHTML(userName: string): string {
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
        <h1>3 Ways PropIQ Finds Deals Others Miss 🔍</h1>

        <p>Hi ${userName},</p>

        <p>Most investors rely on basic calculators and gut feelings. PropIQ uses AI to uncover insights that traditional tools can't.</p>

        <p>Here's how PropIQ gives you the edge:</p>

        <div class="feature-card">
            <strong>🎯 Deal Score Algorithm</strong><br>
            Our proprietary 0-100 scoring system analyzes 15+ investment metrics instantly. See if a property is a green light (80+), yellow flag (50-79), or red alert (below 50) before you waste time on a bad deal.
        </div>

        <div class="feature-card">
            <strong>📊 Comprehensive Comp Analysis</strong><br>
            PropIQ doesn't just show you comps - it analyzes pricing trends, days on market, and neighborhood dynamics to tell you if you're getting a good deal or overpaying.
        </div>

        <div class="feature-card">
            <strong>💰 Cash Flow Projections</strong><br>
            See 5-year financial projections with best/worst case scenarios. Know your cap rate, cash-on-cash return, and whether the property passes the 1% rule - all in seconds.
        </div>

        <a href="${APP_URL}" class="cta-button">Analyze Your First Property →</a>

        <p style="margin-top: 32px;"><strong>Pro tip:</strong> The best deals get snatched up fast. Use PropIQ to analyze properties the moment they hit the market, so you can make confident offers before your competition.</p>

        <p>Ready to find your next deal?</p>

        <p>The PropIQ Team</p>

        <div class="footer">
            <p>© 2025 PropIQ by LUNTRA<br>
            <a href="${APP_URL}" style="color: #4F46E5;">propiq.luntra.one</a></p>
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Day 3 email template - Social proof and use cases
 */
function getDay3EmailHTML(userName: string): string {
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
        .use-case {
            background: #f0fdf4;
            border-left: 4px solid #10b981;
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
        <h1>How Investors Are Using PropIQ 🏠</h1>

        <p>Hi ${userName},</p>

        <p>Wondering how other investors use PropIQ in their workflow? Here are three common scenarios:</p>

        <div class="use-case">
            <strong>🔄 Fix & Flip Analysis</strong><br>
            "I analyze potential flips to see if the ARV justifies the renovation costs. PropIQ's comp analysis helps me estimate realistic sale prices instead of wishful thinking."
            <p style="margin: 8px 0 0 0; font-size: 14px;"><em>— Sarah M., Residential Flipper</em></p>
        </div>

        <div class="use-case">
            <strong>🏘️ Rental Property Evaluation</strong><br>
            "Before I even schedule a showing, I run the numbers in PropIQ. If it doesn't hit my 8% cap rate minimum, I move on. Saves me hours every week."
            <p style="margin: 8px 0 0 0; font-size: 14px;"><em>— James T., Portfolio Investor (12 units)</em></p>
        </div>

        <div class="use-case">
            <strong>💼 Wholesale Deal Assessment</strong><br>
            "I use PropIQ to quickly evaluate wholesale deals. The AI spots red flags I might miss, and the deal score helps me negotiate better assignments."
            <p style="margin: 8px 0 0 0; font-size: 14px;"><em>— Marcus L., Wholesaler</em></p>
        </div>

        <a href="${APP_URL}" class="cta-button">See What You're Missing →</a>

        <p style="margin-top: 32px;"><strong>Your turn:</strong> What's your investment strategy? Whether you're flipping, renting, or wholesaling, PropIQ adapts to your needs.</p>

        <p>Start analyzing today!</p>

        <p>The PropIQ Team</p>

        <div class="footer">
            <p>© 2025 PropIQ by LUNTRA<br>
            <a href="${APP_URL}" style="color: #4F46E5;">propiq.luntra.one</a></p>
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Day 4 email template - Upgrade prompt
 */
function getDay4EmailHTML(userName: string, analysesRemaining: number): string {
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
        .pricing-card {
            background: #f3f4f6;
            border: 2px solid #e5e7eb;
            padding: 20px;
            margin: 16px 0;
            border-radius: 8px;
            text-align: center;
        }
        .pricing-card.featured {
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            color: white;
            border-color: #4F46E5;
        }
        .price {
            font-size: 32px;
            font-weight: bold;
            margin: 8px 0;
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
        <h1>Your Free Analyses Are Waiting ⏰</h1>

        <p>Hi ${userName},</p>

        <p>You have <strong>${analysesRemaining} free ${analysesRemaining === 1 ? 'analysis' : 'analyses'}</strong> remaining on your trial. Don't let them go to waste!</p>

        <p>But here's the thing - serious investors analyze <em>dozens</em> of properties before finding the right deal. That's why our paid plans exist:</p>

        <div class="pricing-card">
            <h3 style="margin-top: 0;">Starter</h3>
            <div class="price">$49<span style="font-size: 16px;">/month</span></div>
            <p>Unlimited analyses<br>All features unlocked<br>Perfect for new investors</p>
        </div>

        <div class="pricing-card featured">
            <h3 style="margin-top: 0; color: white;">Pro</h3>
            <div class="price" style="color: white;">$99<span style="font-size: 16px;">/month</span></div>
            <p style="color: rgba(255,255,255,0.9);">Unlimited analyses<br>Priority support<br>Export reports (coming soon)<br>Best for active investors</p>
        </div>

        <div class="pricing-card">
            <h3 style="margin-top: 0;">Elite</h3>
            <div class="price">$199<span style="font-size: 16px;">/month</span></div>
            <p>Everything in Pro<br>Advanced analytics<br>Market alerts (coming soon)<br>For portfolio builders</p>
        </div>

        <a href="${APP_URL}/pricing" class="cta-button">Upgrade to Pro →</a>

        <p style="margin-top: 32px;"><strong>Think about it:</strong> If PropIQ helps you avoid just ONE bad deal, it's paid for itself dozens of times over. Most investors lose $10K+ on their first mistake. We're $99/month.</p>

        <p>Ready to level up your deal analysis?</p>

        <p>The PropIQ Team</p>

        <div class="footer">
            <p>© 2025 PropIQ by LUNTRA<br>
            <a href="${APP_URL}" style="color: #4F46E5;">propiq.luntra.one</a></p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
                No credit card required to continue your free trial.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}
