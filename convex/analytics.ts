
import { v } from "convex/values";
import { internalMutation, internalQuery, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// --------------------------------------------------------------------------
// QUERY: Generate Weekly Stats
// --------------------------------------------------------------------------
export const generateWeeklyStats = internalQuery({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

        // 1. User Funnel & Subscriptions
        const allUsers = await ctx.db.query("users").collect();
        const totalUsers = allUsers.length;

        const newUsers = allUsers.filter(u => u.createdAt > oneWeekAgo).length;

        // Tier Breakdown
        let free = 0;
        let pro = 0;
        let elite = 0;
        let paying = 0;

        // B2B Signal Tracker
        let b2bCount = 0;
        // Common public email domains to filter out
        const publicDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "protonmail.com"];

        for (const u of allUsers) {
            // Tiers
            const tier = (u.subscriptionTier || "free").toLowerCase();
            if (tier === "pro") pro++;
            else if (tier === "elite") elite++;
            else free++;

            if (tier !== "free") paying++;

            // B2B Check
            if (u.email) {
                const domain = u.email.split("@")[1]?.toLowerCase();
                if (domain && !publicDomains.includes(domain)) {
                    b2bCount++;
                }
            }
        }

        // 2. Revenue (MRR Valuation)
        const PRICE_PRO = 79;
        const PRICE_ELITE = 199;
        const mrr = (pro * PRICE_PRO) + (elite * PRICE_ELITE);
        const arpu = paying > 0 ? mrr / paying : 0;

        // 3. Churn & Downgrades (from Stripe Events or derived)
        // Query stripeEvents for 'customer.subscription.deleted' in last week
        const churnEvents = await ctx.db
            .query("stripeEvents")
            .filter((q) =>
                q.and(
                    q.eq(q.field("eventType"), "customer.subscription.deleted"),
                    q.gte(q.field("createdAt"), oneWeekAgo)
                )
            )
            .collect();

        // Note: This is an approximation. Ideally we'd look at subscriptionStatus changes in users table too.
        const churnedUsers = churnEvents.length;

        // Downgrades hard to track purely from events without parsing JSON, 
        // but we can estimate or placeholder it. 
        // For now, let's look at upgrades vs downgrades if we had efficient logs.
        // Simplifying: Set downgrade to 0 (placeholder) or require parsing "customer.subscription.updated".
        const downgradedUsers = 0;

        // Conversion Rate: New Paying Users / New Users (Approx)
        // Actually, distinct Free -> Paid events would be better. 
        // Proxy: (Total Paying Now - (Total Paying Last Week - Churn))... 
        // Let's keep it simple: % of TOTAL users who are paying.
        const conversionRate = totalUsers > 0 ? paying / totalUsers : 0;

        return {
            weekStarting: now,
            totalUsers,
            newUsers,
            freeUsers: free,
            proUsers: pro,
            eliteUsers: elite,
            mrr,
            payingUserCount: paying,
            arpu,
            churnedUsers,
            downgradedUsers,
            conversionRate,
            b2bUserCount: b2bCount,
            b2bPercent: totalUsers > 0 ? b2bCount / totalUsers : 0,
            createdAt: now
        };
    },
});

// --------------------------------------------------------------------------
// MUTATION: Save Snapshot
// --------------------------------------------------------------------------
export const saveSnapshot = internalMutation({
    args: {
        stats: v.object({
            weekStarting: v.number(),
            totalUsers: v.number(),
            newUsers: v.number(),
            freeUsers: v.number(),
            proUsers: v.number(),
            eliteUsers: v.number(),
            mrr: v.number(),
            payingUserCount: v.number(),
            arpu: v.number(),
            churnedUsers: v.number(),
            downgradedUsers: v.number(),
            conversionRate: v.number(),
            b2bUserCount: v.number(),
            b2bPercent: v.number(),
            createdAt: v.number(),
        })
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("analyticsSnapshots", args.stats);
    }
});

// --------------------------------------------------------------------------
// ACTION: Send Weekly Email
// --------------------------------------------------------------------------
export const sendWeeklyEmail = internalAction({
    args: {},
    handler: async (ctx) => {
        // 1. Get Stats
        const stats = await ctx.runQuery(internal.analytics.generateWeeklyStats);

        // 2. Save Snapshot
        await ctx.runMutation(internal.analytics.saveSnapshot, { stats });

        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        // const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "bdusape@gmail.com"; 
        const ADMIN_EMAIL = "bdusape@gmail.com";

        if (!RESEND_API_KEY) {
            console.error("RESEND_API_KEY not configured. Cannot send dashboard email.");
            return;
        }

        // 3. Status Flags
        const getStatus = (val: number, goodLimit: number, badLimit: number, reverse = false) => {
            if (reverse) {
                if (val <= goodLimit) return "🟢";
                if (val <= badLimit) return "🟡";
                return "🔴";
            }
            if (val >= goodLimit) return "🟢";
            if (val >= badLimit) return "🟡";
            return "🔴";
        };

        const mrrFlag = getStatus(stats.mrr, 10000, 5000);
        const churnFlag = getStatus(stats.churnedUsers, 1, 3, true);
        const b2bFlag = getStatus(stats.b2bPercent, 0.20, 0.10);

        // 4. Generate AI Insights via Azure OpenAI (or Bedrock when LLM_PROVIDER=bedrock)
        let aiInsights = "<p><em>AI Analysis unavailable (Check Azure credentials or LLM_PROVIDER).</em></p>";
        let aiSubject = `PropIQ Weekly Intel: $${stats.mrr.toLocaleString()} MRR`;

        const LLM_PROVIDER = (process.env.LLM_PROVIDER || "azure").toLowerCase();
        const OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
        const OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
        const OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";
        const API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";

        if (LLM_PROVIDER !== "bedrock" && OPENAI_ENDPOINT && OPENAI_KEY) {
            try {
                // Construct prompt with data
                const prompt = `
                You are a senior business intelligence analyst for PropIQ. Analyze these weekly metrics:
                
                METRICS:
                - MRR: $${stats.mrr}
                - Total Users: ${stats.totalUsers} (New this week: ${stats.newUsers})
                - Paying Users: ${stats.payingUserCount} (Conversion Rate: ${(stats.conversionRate * 100).toFixed(1)}%)
                - Churn (7d): ${stats.churnedUsers} users
                - B2B Signal: ${(stats.b2bPercent * 100).toFixed(1)}% of users have work emails
                - Tier Split: ${stats.freeUsers} Free / ${stats.proUsers} Pro / ${stats.eliteUsers} Elite

                TASK:
                1. Identify one "Red Flag" (Critical Risk).
                2. Identify one "Green Flag" (Win).
                3. Identify one "Opportunity" (Strategic move).
                4. Write a short, punchy subject line for this email.

                FORMAT:
                Return JSON: { "html": "<HTML string for the body (use <h3>, <ul>, <li>)>", "subject": "<Subject Line>" }
                `;

                // Call Azure OpenAI
                const url = `${OPENAI_ENDPOINT}openai/deployments/${OPENAI_DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`;
                const aiRes = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "api-key": OPENAI_KEY },
                    body: JSON.stringify({
                        messages: [
                            { role: "system", content: "You are a helpful data analyst. Output perfectly valid JSON only." },
                            { role: "user", content: prompt }
                        ],
                        response_format: { type: "json_object" }
                    })
                });

                if (aiRes.ok) {
                    const data = await aiRes.json();
                    const content = JSON.parse(data.choices[0].message.content);
                    aiInsights = content.html;
                    aiSubject = content.subject;
                } else {
                    console.error("AI Error:", await aiRes.text());
                }
            } catch (e) {
                console.error("AI Exception:", e);
            }
        }

        const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #111827;">PropIQ Intelligence</h2>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Week of ${new Date().toLocaleDateString()}</p>
        </div>
        
        <!-- AI Analyst Section -->
        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="margin-top: 0; color: #0369a1; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em;">🤖 AI Analyst Insights</h3>
            <div style="color: #334155; line-height: 1.6;">
                ${aiInsights}
            </div>
        </div>

        <!-- Metrics Table -->
        <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
          <thead>
            <tr style="background: #f8fafc;">
                <th style="text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; color: #475569;">Metric</th>
                <th style="text-align: right; padding: 12px; border-bottom: 2px solid #e2e8f0; color: #475569;">Value</th>
                <th style="text-align: center; padding: 12px; border-bottom: 2px solid #e2e8f0; color: #475569;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;"><strong>Monthly Recurring Revenue</strong></td>
                <td style="text-align: right; padding: 12px; border-bottom: 1px solid #f1f5f9; font-family: monospace; font-size: 14px;">$${stats.mrr.toLocaleString()}</td>
                <td style="text-align: center; padding: 12px; border-bottom: 1px solid #f1f5f9;">${mrrFlag}</td>
            </tr>
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">Active Users</td>
                <td style="text-align: right; padding: 12px; border-bottom: 1px solid #f1f5f9; font-family: monospace; font-size: 14px;">${stats.totalUsers.toLocaleString()}</td>
                <td style="text-align: center; padding: 12px; border-bottom: 1px solid #f1f5f9;">ℹ️</td>
            </tr>
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">New Signups (7d)</td>
                <td style="text-align: right; padding: 12px; border-bottom: 1px solid #f1f5f9; font-family: monospace; font-size: 14px;">+${stats.newUsers}</td>
                <td style="text-align: center; padding: 12px; border-bottom: 1px solid #f1f5f9;">-</td>
            </tr>
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">Churned Users</td>
                <td style="text-align: right; padding: 12px; border-bottom: 1px solid #f1f5f9; font-family: monospace; font-size: 14px;">${stats.churnedUsers}</td>
                <td style="text-align: center; padding: 12px; border-bottom: 1px solid #f1f5f9;">${churnFlag}</td>
            </tr>
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">B2B Signal (Work Emails)</td>
                <td style="text-align: right; padding: 12px; border-bottom: 1px solid #f1f5f9; font-family: monospace; font-size: 14px;">${(stats.b2bPercent * 100).toFixed(1)}%</td>
                <td style="text-align: center; padding: 12px; border-bottom: 1px solid #f1f5f9;">${b2bFlag}</td>
            </tr>
          </tbody>
        </table>
        
        <!-- Footer -->
        <div style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center;">
            <p>Generated automatically by PropIQ Cloud • <a href="https://propiq.luntra.one/admin" style="color: #6b7280; text-decoration: none;">View Admin Dashboard</a></p>
        </div>
      </div>
    </body>
    </html>
    `;

        // 4. Send Email
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "PropIQ Intelligence <bot@propiq.luntra.one>",
                to: ADMIN_EMAIL,
                subject: aiSubject,
                html: html,
            }),
        });

        if (!response.ok) {
            console.error("Failed to send dashboard email", await response.text());
            return { success: false };
        }

        console.log("Weekly dashboard email sent to", ADMIN_EMAIL);
        return { success: true };
    }
});
