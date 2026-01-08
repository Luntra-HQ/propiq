/**
 * Email Scheduler for Post-Signup Onboarding Sequence
 *
 * Automated email system that onboards new trial users
 *
 * Sequence:
 * - Day 0: Welcome email (after email verification) - "Run your first analysis in 60 seconds"
 * - Day 1: Feature overview - "Here's what PropIQ can do"
 * - Day 3: Deal Calculator highlight - "Have you tried the Deal Calculator?"
 * - Day 7: Urgency reminder - "You have 2 free analyses left"
 *
 * Runs daily via cron jobs to check for eligible users
 */

import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Type declaration for Node.js process environment variables
declare const process: { env: Record<string, string | undefined> };

/**
 * Send Day 1 onboarding email to users
 * Runs daily at 9 AM EST via cron
 */
export const checkUsersForDay1Onboarding = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("[ONBOARDING] Checking for Day 1 onboarding emails...");

    // Get users eligible for Day 1 email
    const users = await ctx.runQuery(internal.onboardingEmailScheduler.getUsersForDay1Email);

    console.log(`[ONBOARDING] Found ${users.length} users for Day 1 onboarding`);

    if (users.length === 0) {
      return { sent: 0, message: "No users eligible for Day 1 onboarding" };
    }

    let sent = 0;
    let failed = 0;

    // Send email to each eligible user
    for (const user of users) {
      try {
        await sendDay1OnboardingEmail(user);

        // Mark email as sent in database
        await ctx.runMutation(internal.onboardingEmailScheduler.markDay1EmailSent, {
          userId: user._id,
        });

        sent++;
        console.log(`[ONBOARDING] Day 1 email sent to: ${user.email}`);
      } catch (error) {
        failed++;
        console.error(`[ONBOARDING] Failed to send Day 1 email to ${user.email}:`, error);
      }
    }

    console.log(`[ONBOARDING] Day 1 complete: ${sent} sent, ${failed} failed`);

    return {
      sent,
      failed,
      message: `Day 1 onboarding complete: ${sent}/${users.length} emails sent`,
    };
  },
});

/**
 * Send Day 3 onboarding email to users
 * Runs daily at 9:30 AM EST via cron
 */
export const checkUsersForDay3Onboarding = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("[ONBOARDING] Checking for Day 3 onboarding emails...");

    // Get users eligible for Day 3 email
    const users = await ctx.runQuery(internal.onboardingEmailScheduler.getUsersForDay3Email);

    console.log(`[ONBOARDING] Found ${users.length} users for Day 3 onboarding`);

    if (users.length === 0) {
      return { sent: 0, message: "No users eligible for Day 3 onboarding" };
    }

    let sent = 0;
    let failed = 0;

    // Send email to each eligible user
    for (const user of users) {
      try {
        await sendDay3OnboardingEmail(user);

        // Mark email as sent in database
        await ctx.runMutation(internal.onboardingEmailScheduler.markDay3EmailSent, {
          userId: user._id,
        });

        sent++;
        console.log(`[ONBOARDING] Day 3 email sent to: ${user.email}`);
      } catch (error) {
        failed++;
        console.error(`[ONBOARDING] Failed to send Day 3 email to ${user.email}:`, error);
      }
    }

    console.log(`[ONBOARDING] Day 3 complete: ${sent} sent, ${failed} failed`);

    return {
      sent,
      failed,
      message: `Day 3 onboarding complete: ${sent}/${users.length} emails sent`,
    };
  },
});

/**
 * Send Day 7 onboarding email to users
 * Runs daily at 10 AM EST via cron
 */
export const checkUsersForDay7Onboarding = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("[ONBOARDING] Checking for Day 7 onboarding emails...");

    // Get users eligible for Day 7 email
    const users = await ctx.runQuery(internal.onboardingEmailScheduler.getUsersForDay7Email);

    console.log(`[ONBOARDING] Found ${users.length} users for Day 7 onboarding`);

    if (users.length === 0) {
      return { sent: 0, message: "No users eligible for Day 7 onboarding" };
    }

    let sent = 0;
    let failed = 0;

    // Send email to each eligible user
    for (const user of users) {
      try {
        await sendDay7OnboardingEmail(user);

        // Mark email as sent in database
        await ctx.runMutation(internal.onboardingEmailScheduler.markDay7EmailSent, {
          userId: user._id,
        });

        sent++;
        console.log(`[ONBOARDING] Day 7 email sent to: ${user.email}`);
      } catch (error) {
        failed++;
        console.error(`[ONBOARDING] Failed to send Day 7 email to ${user.email}:`, error);
      }
    }

    console.log(`[ONBOARDING] Day 7 complete: ${sent} sent, ${failed} failed`);

    return {
      sent,
      failed,
      message: `Day 7 onboarding complete: ${sent}/${users.length} emails sent`,
    };
  },
});

/**
 * Get users eligible for Day 1 onboarding email
 * - Signed up 1 day ago
 * - Email verified
 * - Haven't received Day 1 email yet
 * - Not on paid plan
 */
export const getUsersForDay1Email = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000; // 24 hours
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000; // 48 hours

    // Get all users who signed up 1 day ago (with 24-hour window)
    const allUsers = await ctx.db.query("users").collect();

    const eligibleUsers = allUsers.filter((user) => {
      // Must have signed up between 1-2 days ago
      if (user.createdAt > oneDayAgo || user.createdAt < twoDaysAgo) {
        return false;
      }

      // Must have verified email
      if (!user.emailVerified) {
        return false;
      }

      // Must not have received Day 1 email yet
      if (user.onboardingDay1Sent) {
        return false;
      }

      // Skip paid users (sequence only for free trial)
      if (user.subscriptionTier !== "free") {
        return false;
      }

      return true;
    });

    return eligibleUsers;
  },
});

/**
 * Get users eligible for Day 3 onboarding email
 * - Signed up 3 days ago
 * - Email verified
 * - Haven't received Day 3 email yet
 * - Not on paid plan
 */
export const getUsersForDay3Email = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000; // 72 hours
    const fourDaysAgo = now - 4 * 24 * 60 * 60 * 1000; // 96 hours

    // Get all users who signed up 3 days ago (with 24-hour window)
    const allUsers = await ctx.db.query("users").collect();

    const eligibleUsers = allUsers.filter((user) => {
      // Must have signed up between 3-4 days ago
      if (user.createdAt > threeDaysAgo || user.createdAt < fourDaysAgo) {
        return false;
      }

      // Must have verified email
      if (!user.emailVerified) {
        return false;
      }

      // Must not have received Day 3 email yet
      if (user.onboardingDay3Sent) {
        return false;
      }

      // Skip paid users (sequence only for free trial)
      if (user.subscriptionTier !== "free") {
        return false;
      }

      return true;
    });

    return eligibleUsers;
  },
});

/**
 * Get users eligible for Day 7 onboarding email
 * - Signed up 7 days ago
 * - Email verified
 * - Haven't received Day 7 email yet
 * - Not on paid plan
 */
export const getUsersForDay7Email = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000; // 168 hours
    const eightDaysAgo = now - 8 * 24 * 60 * 60 * 1000; // 192 hours

    // Get all users who signed up 7 days ago (with 24-hour window)
    const allUsers = await ctx.db.query("users").collect();

    const eligibleUsers = allUsers.filter((user) => {
      // Must have signed up between 7-8 days ago
      if (user.createdAt > sevenDaysAgo || user.createdAt < eightDaysAgo) {
        return false;
      }

      // Must have verified email
      if (!user.emailVerified) {
        return false;
      }

      // Must not have received Day 7 email yet
      if (user.onboardingDay7Sent) {
        return false;
      }

      // Skip paid users (sequence only for free trial)
      if (user.subscriptionTier !== "free") {
        return false;
      }

      return true;
    });

    return eligibleUsers;
  },
});

/**
 * Mark Day 1 email as sent for a user
 */
export const markDay1EmailSent = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      onboardingDay1Sent: true,
      onboardingDay1SentAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Mark Day 3 email as sent for a user
 */
export const markDay3EmailSent = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      onboardingDay3Sent: true,
      onboardingDay3SentAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Mark Day 7 email as sent for a user
 */
export const markDay7EmailSent = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      onboardingDay7Sent: true,
      onboardingDay7SentAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Send Day 0 welcome email (triggered immediately after email verification)
 */
export async function sendDay0WelcomeEmail(user: any): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const firstName = user.firstName || "there";
  const email = user.email;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PropIQ - Run Your First Analysis</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                Welcome to PropIQ! 🏡
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                AI-Powered Real Estate Analysis
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 40px 40px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                Hi ${firstName},
              </h2>

              <p style="margin: 0 0 16px 0; color: #333; font-size: 16px; line-height: 1.6;">
                Thanks for verifying your email! Your PropIQ account is now active and ready to use.
              </p>

              <p style="margin: 0 0 24px 0; color: #333; font-size: 16px; line-height: 1.6;">
                You have <strong>3 free property analyses</strong> waiting for you. Let's run your first one right now - it takes less than 60 seconds!
              </p>

              <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 24px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 17px; font-weight: 600;">
                  🚀 Quick Start (60 seconds):
                </p>
                <ol style="margin: 0; padding-left: 20px; color: #333; font-size: 15px; line-height: 2;">
                  <li>Click "Analyze Property" below</li>
                  <li>Enter any property address you're considering</li>
                  <li>Get instant AI-powered insights and deal score</li>
                </ol>
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://propiq.luntra.one/analyze?utm_source=email&utm_medium=onboarding&utm_campaign=day0&utm_content=cta"
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 18px; font-weight: 700; box-shadow: 0 4px 6px rgba(102,126,234,0.3);">
                      Analyze Your First Property →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                <strong>What you get with PropIQ:</strong>
              </p>

              <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #333; font-size: 15px; line-height: 1.8;">
                <li>IRR, cash-on-cash return, cap rate calculations</li>
                <li>5-year financial projections</li>
                <li>AI-powered investment recommendations</li>
                <li>Deal scoring (0-100 rating system)</li>
                <li>Unlimited access to deal calculator</li>
              </ul>

              <p style="margin: 24px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                Questions? Just reply to this email - we're here to help!
              </p>

              <p style="margin: 16px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                Best,<br>
                <strong>The PropIQ Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 8px 0; color: #666; font-size: 12px; text-align: center;">
                PropIQ - AI-Powered Real Estate Investment Analysis
              </p>
              <p style="margin: 0; color: #999; font-size: 11px; text-align: center;">
                <a href="https://propiq.luntra.one/unsubscribe?email=${encodeURIComponent(email)}" style="color: #999; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "PropIQ <noreply@propiq.luntra.one>",
      to: email,
      subject: `${firstName}, your PropIQ account is ready! 🎉`,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API error: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  console.log(`[RESEND] Day 0 welcome email sent: ${result.id}`);
}

/**
 * Send Day 1 onboarding email via Resend
 */
async function sendDay1OnboardingEmail(user: any): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const firstName = user.firstName || "there";
  const email = user.email;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Here's What PropIQ Can Do</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 28px; font-weight: 700;">
                PropIQ
              </h1>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                AI-Powered Real Estate Analysis
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 22px; font-weight: 600;">
                Hi ${firstName},
              </h2>

              <p style="margin: 0 0 16px 0; color: #333; font-size: 16px; line-height: 1.6;">
                You signed up for PropIQ yesterday. Have you had a chance to analyze a property yet?
              </p>

              <p style="margin: 0 0 24px 0; color: #333; font-size: 16px; line-height: 1.6;">
                Here's a quick overview of what PropIQ can do for you:
              </p>

              <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 16px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                  🏡 AI-Powered Property Analysis
                </h3>
                <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6;">
                  Enter any property address and get instant insights: IRR, cash flow, cap rate, and AI recommendations tailored to your investment goals.
                </p>
              </div>

              <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 16px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                  🧮 Free Unlimited Deal Calculator
                </h3>
                <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6;">
                  Run unlimited scenarios with our advanced calculator. Test different down payments, interest rates, and holding periods - completely free!
                </p>
              </div>

              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 16px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                  📊 Deal Scoring & Insights
                </h3>
                <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6;">
                  Every property gets a 0-100 deal score with color-coded ratings. Quickly identify winners and avoid money pits.
                </p>
              </div>

              <p style="margin: 24px 0 16px 0; color: #333; font-size: 16px; line-height: 1.6;">
                You still have <strong>${user.analysesLimit - user.analysesUsed} free analyses left</strong>. Try one now!
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://propiq.luntra.one/analyze?utm_source=email&utm_medium=onboarding&utm_campaign=day1&utm_content=cta"
                       style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(59,130,246,0.3);">
                      Analyze a Property Now →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                Questions? Just reply to this email!
              </p>

              <p style="margin: 16px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                Best,<br>
                <strong>The PropIQ Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 8px 0; color: #666; font-size: 12px; text-align: center;">
                PropIQ - AI-Powered Real Estate Investment Analysis
              </p>
              <p style="margin: 0; color: #999; font-size: 11px; text-align: center;">
                <a href="https://propiq.luntra.one/unsubscribe?email=${encodeURIComponent(email)}" style="color: #999; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "PropIQ <noreply@propiq.luntra.one>",
      to: email,
      subject: `${firstName}, here's what PropIQ can do for you`,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API error: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  console.log(`[RESEND] Day 1 onboarding email sent: ${result.id}`);
}

/**
 * Send Day 3 onboarding email via Resend
 */
async function sendDay3OnboardingEmail(user: any): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const firstName = user.firstName || "there";
  const email = user.email;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Have You Tried the Deal Calculator?</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 28px; font-weight: 700;">
                PropIQ
              </h1>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                AI-Powered Real Estate Analysis
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 22px; font-weight: 600;">
                ${firstName}, have you tried the Deal Calculator?
              </h2>

              <p style="margin: 0 0 16px 0; color: #333; font-size: 16px; line-height: 1.6;">
                Three days in - you're getting the hang of PropIQ! 🎯
              </p>

              <p style="margin: 0 0 24px 0; color: #333; font-size: 16px; line-height: 1.6;">
                I wanted to highlight one of the most powerful (and free!) features: <strong>the PropIQ Deal Calculator</strong>.
              </p>

              <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 24px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 17px; font-weight: 600;">
                  🧮 What Makes It Special:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 15px; line-height: 1.8;">
                  <li><strong>Unlimited use</strong> - completely free, forever</li>
                  <li><strong>3 tabs:</strong> Basic, Advanced, and Scenario Analysis</li>
                  <li><strong>5-year projections</strong> - see the full financial picture</li>
                  <li><strong>Real-time calculations</strong> - adjust inputs, see instant results</li>
                  <li><strong>Deal scoring (0-100)</strong> - know if it's a good deal at a glance</li>
                </ul>
              </div>

              <p style="margin: 0 0 16px 0; color: #333; font-size: 16px; line-height: 1.6;">
                Pro tip: Use the Scenario Analysis tab to test "what if" situations - different down payments, interest rates, or rent increases. It's like having a financial analyst in your pocket!
              </p>

              <p style="margin: 0 0 16px 0; color: #333; font-size: 16px; line-height: 1.6;">
                And don't forget: you still have <strong>${user.analysesLimit - user.analysesUsed} AI property analyses left</strong> for more detailed insights.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://propiq.luntra.one/calculator?utm_source=email&utm_medium=onboarding&utm_campaign=day3&utm_content=cta"
                       style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(34,197,94,0.3);">
                      Try the Deal Calculator →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                Questions about how to use it? Just reply to this email!
              </p>

              <p style="margin: 16px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                Best,<br>
                <strong>The PropIQ Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 8px 0; color: #666; font-size: 12px; text-align: center;">
                PropIQ - AI-Powered Real Estate Investment Analysis
              </p>
              <p style="margin: 0; color: #999; font-size: 11px; text-align: center;">
                <a href="https://propiq.luntra.one/unsubscribe?email=${encodeURIComponent(email)}" style="color: #999; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "PropIQ <noreply@propiq.luntra.one>",
      to: email,
      subject: `${firstName}, have you tried the Deal Calculator?`,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API error: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  console.log(`[RESEND] Day 3 onboarding email sent: ${result.id}`);
}

/**
 * Send Day 7 onboarding email via Resend
 */
async function sendDay7OnboardingEmail(user: any): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const firstName = user.firstName || "there";
  const email = user.email;
  const analysesLeft = user.analysesLimit - user.analysesUsed;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You Have ${analysesLeft} Free Analyses Left</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 28px; font-weight: 700;">
                PropIQ
              </h1>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                AI-Powered Real Estate Analysis
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 22px; font-weight: 600;">
                ${firstName}, you have ${analysesLeft} free analyses left
              </h2>

              <p style="margin: 0 0 16px 0; color: #333; font-size: 16px; line-height: 1.6;">
                It's been a week since you joined PropIQ. How's your property analysis journey going?
              </p>

              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 15px; font-weight: 600;">
                  ⏰ You have ${analysesLeft} free AI property analyses remaining
                </p>
              </div>

              <p style="margin: 0 0 16px 0; color: #333; font-size: 16px; line-height: 1.6;">
                <strong>Don't let them expire!</strong> Use them to:
              </p>

              <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #333; font-size: 15px; line-height: 1.8;">
                <li>Analyze properties you're considering buying</li>
                <li>Compare multiple deals side-by-side</li>
                <li>Get AI recommendations on investment potential</li>
                <li>See 5-year financial projections</li>
                <li>Identify red flags before making an offer</li>
              </ul>

              <p style="margin: 0 0 16px 0; color: #333; font-size: 16px; line-height: 1.6;">
                Plus, remember: the <strong>Deal Calculator is always free and unlimited</strong> - use it to test as many scenarios as you want!
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://propiq.luntra.one/analyze?utm_source=email&utm_medium=onboarding&utm_campaign=day7&utm_content=cta"
                       style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 18px; font-weight: 700; box-shadow: 0 4px 6px rgba(220,38,38,0.3);">
                      Use Your Free Analyses →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                <strong>Need more analyses?</strong> Upgrade to a paid plan for unlimited AI analysis:
              </p>

              <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.6;">
                <li><strong>Starter ($29/mo):</strong> 20 analyses/month</li>
                <li><strong>Pro ($79/mo):</strong> 100 analyses/month</li>
                <li><strong>Elite ($199/mo):</strong> Unlimited analyses</li>
              </ul>

              <p style="margin: 16px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                <a href="https://propiq.luntra.one/pricing?utm_source=email&utm_medium=onboarding&utm_campaign=day7" style="color: #3b82f6; text-decoration: underline;">View pricing plans →</a>
              </p>

              <p style="margin: 24px 0 0 0; color: #666; font-size: 14px; line-height: 1.6; font-style: italic;">
                P.S. - Still have questions? Reply to this email and we'll help you get the most out of PropIQ!
              </p>

              <p style="margin: 16px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                Best,<br>
                <strong>The PropIQ Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 8px 0; color: #666; font-size: 12px; text-align: center;">
                PropIQ - AI-Powered Real Estate Investment Analysis
              </p>
              <p style="margin: 0; color: #999; font-size: 11px; text-align: center;">
                <a href="https://propiq.luntra.one/unsubscribe?email=${encodeURIComponent(email)}" style="color: #999; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "PropIQ <noreply@propiq.luntra.one>",
      to: email,
      subject: `${firstName}, you have ${analysesLeft} free analyses left`,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API error: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  console.log(`[RESEND] Day 7 onboarding email sent: ${result.id}`);
}
