/**
 * Email Scheduler for Lead Nurture Sequence
 *
 * Automated email system that nurtures leads captured from lead magnets
 *
 * Sequence:
 * - Day 3: First follow-up (remind about PropIQ, share success story)
 * - Day 7: Final follow-up (last chance CTA, urgency)
 *
 * Runs daily via cron jobs to check for eligible leads
 */

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Send Day 3 nurture email to leads
 * Runs daily at 10 AM EST via cron
 */
export const checkLeadsForDay3Nurture = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("[EMAIL SCHEDULER] Checking for Day 3 nurture emails...");

    // Get leads eligible for Day 3 email
    const leads = await ctx.runQuery(internal.leads.getLeadsForDay3Nurture);

    console.log(`[EMAIL SCHEDULER] Found ${leads.length} leads for Day 3 nurture`);

    if (leads.length === 0) {
      return { sent: 0, message: "No leads eligible for Day 3 nurture" };
    }

    let sent = 0;
    let failed = 0;

    // Send email to each eligible lead
    for (const lead of leads) {
      try {
        await sendDay3NurtureEmail(lead);

        // Mark email as sent in database
        await ctx.runMutation(internal.leads.markDay3EmailSent, {
          leadId: lead._id,
        });

        sent++;
        console.log(`[EMAIL SCHEDULER] Day 3 email sent to: ${lead.email}`);
      } catch (error) {
        failed++;
        console.error(`[EMAIL SCHEDULER] Failed to send Day 3 email to ${lead.email}:`, error);
      }
    }

    console.log(`[EMAIL SCHEDULER] Day 3 nurture complete: ${sent} sent, ${failed} failed`);

    return {
      sent,
      failed,
      message: `Day 3 nurture complete: ${sent}/${leads.length} emails sent`,
    };
  },
});

/**
 * Send Day 7 nurture email to leads
 * Runs daily at 10:30 AM EST via cron
 */
export const checkLeadsForDay7Nurture = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("[EMAIL SCHEDULER] Checking for Day 7 nurture emails...");

    // Get leads eligible for Day 7 email
    const leads = await ctx.runQuery(internal.leads.getLeadsForDay7Nurture);

    console.log(`[EMAIL SCHEDULER] Found ${leads.length} leads for Day 7 nurture`);

    if (leads.length === 0) {
      return { sent: 0, message: "No leads eligible for Day 7 nurture" };
    }

    let sent = 0;
    let failed = 0;

    // Send email to each eligible lead
    for (const lead of leads) {
      try {
        await sendDay7NurtureEmail(lead);

        // Mark email as sent in database
        await ctx.runMutation(internal.leads.markDay7EmailSent, {
          leadId: lead._id,
        });

        sent++;
        console.log(`[EMAIL SCHEDULER] Day 7 email sent to: ${lead.email}`);
      } catch (error) {
        failed++;
        console.error(`[EMAIL SCHEDULER] Failed to send Day 7 email to ${lead.email}:`, error);
      }
    }

    console.log(`[EMAIL SCHEDULER] Day 7 nurture complete: ${sent} sent, ${failed} failed`);

    return {
      sent,
      failed,
      message: `Day 7 nurture complete: ${sent}/${leads.length} emails sent`,
    };
  },
});

/**
 * Send Day 3 nurture email via Resend
 */
async function sendDay3NurtureEmail(lead: any): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const firstName = lead.firstName || "there";
  const email = lead.email;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PropIQ - Your Real Estate Analysis Awaits</title>
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
                Three days ago, you downloaded our real estate investment checklist. I hope it's been helpful!
              </p>

              <p style="margin: 0 0 16px 0; color: #333; font-size: 16px; line-height: 1.6;">
                I wanted to share something exciting: <strong>PropIQ's AI-powered property analyzer</strong> can automate all those manual calculations you saw in the checklist.
              </p>

              <div style="background-color: #f8f9fa; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 15px; font-weight: 600;">
                  ✨ What PropIQ Does For You:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 15px; line-height: 1.8;">
                  <li>Instant deal analysis (IRR, cash-on-cash, cap rate)</li>
                  <li>5-year financial projections</li>
                  <li>AI-powered recommendations</li>
                  <li>Deal scoring (0-100 rating)</li>
                </ul>
              </div>

              <p style="margin: 0 0 16px 0; color: #333; font-size: 16px; line-height: 1.6;">
                <strong>Start with 3 free property analyses</strong> - no credit card required. See how PropIQ can save you hours of spreadsheet work.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://propiq.luntra.one/signup?utm_source=email&utm_medium=nurture&utm_campaign=day3&utm_content=cta"
                       style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(59,130,246,0.3);">
                      Start Free Trial →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                Questions? Just reply to this email - I read every response.
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
      subject: `${firstName}, ready to analyze your first property?`,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API error: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  console.log(`[RESEND] Day 3 email sent: ${result.id}`);
}

/**
 * Send Day 7 nurture email via Resend
 */
async function sendDay7NurtureEmail(lead: any): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const firstName = lead.firstName || "there";
  const email = lead.email;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PropIQ - Last Chance for Free Property Analysis</title>
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
                ${firstName}, don't miss your free analyses
              </h2>

              <p style="margin: 0 0 16px 0; color: #333; font-size: 16px; line-height: 1.6;">
                A week ago, you downloaded our real estate investment checklist. Since then, hundreds of investors have started using PropIQ to analyze deals faster.
              </p>

              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 15px; font-weight: 600;">
                  ⏰ Your 3 free property analyses are still waiting
                </p>
              </div>

              <p style="margin: 0 0 16px 0; color: #333; font-size: 16px; line-height: 1.6;">
                <strong>Here's what you're missing out on:</strong>
              </p>

              <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #333; font-size: 15px; line-height: 1.8;">
                <li><strong>Save 2+ hours per property</strong> - no more spreadsheets</li>
                <li><strong>Avoid bad deals</strong> - AI spots red flags instantly</li>
                <li><strong>Make confident offers</strong> - backed by data, not guesswork</li>
                <li><strong>5-year projections</strong> - see the full financial picture</li>
              </ul>

              <p style="margin: 0 0 16px 0; color: #333; font-size: 16px; line-height: 1.6;">
                Start your free trial today - <strong>3 property analyses, no credit card required.</strong>
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://propiq.luntra.one/signup?utm_source=email&utm_medium=nurture&utm_campaign=day7&utm_content=cta"
                       style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 18px; font-weight: 700; box-shadow: 0 4px 6px rgba(220,38,38,0.3);">
                      Claim Your Free Analyses →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; color: #666; font-size: 14px; line-height: 1.6; font-style: italic;">
                P.S. - This is the last email I'll send about PropIQ. If you're not ready yet, no worries! But if you want to analyze deals faster, <strong>your free trial is one click away.</strong>
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
      subject: `${firstName}, don't miss your 3 free property analyses`,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API error: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  console.log(`[RESEND] Day 7 email sent: ${result.id}`);
}
