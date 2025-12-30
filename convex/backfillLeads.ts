/**
 * Backfill Script - Create lead captures for existing users
 * This migration adds all existing users to the leadCaptures table
 * so they can be tracked in the nurture system
 */

import { mutation } from "./_generated/server";

/**
 * Backfill lead captures for all users who don't have one
 * Run this once to migrate existing users into the lead tracking system
 */
export const backfillLeadCaptures = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("[BACKFILL] Starting lead capture backfill...");

    // Get all users
    const allUsers = await ctx.db.query("users").collect();
    console.log(`[BACKFILL] Found ${allUsers.length} total users`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of allUsers) {
      try {
        // Check if this user already has a lead capture
        const existingLead = await ctx.db
          .query("leadCaptures")
          .withIndex("by_email", (q) => q.eq("email", user.email))
          .first();

        if (existingLead) {
          // User already has a lead capture - check if it's linked to the user
          if (!existingLead.userId) {
            // Link the existing lead to this user
            await ctx.db.patch(existingLead._id, {
              userId: user._id,
              status: "converted_trial",
              convertedAt: user.createdAt,
            });
            console.log(`[BACKFILL] Linked existing lead to user: ${user.email}`);
            created++;
          } else {
            skipped++;
          }
        } else {
          // Create a new lead capture for this user
          await ctx.db.insert("leadCaptures", {
            email: user.email,
            firstName: user.firstName,
            leadMagnet: "backfill-migration",
            source: "backfill",
            status: "converted_trial",
            userId: user._id,
            capturedAt: user.createdAt,
            convertedAt: user.createdAt,
          });
          console.log(`[BACKFILL] Created lead capture for: ${user.email}`);
          created++;
        }
      } catch (e) {
        console.error(`[BACKFILL] Error processing user ${user.email}:`, e);
        errors++;
      }
    }

    const summary = {
      totalUsers: allUsers.length,
      leadsCreated: created,
      usersSkipped: skipped,
      errors,
      success: true,
      message: `Backfill complete: ${created} leads created/linked, ${skipped} skipped, ${errors} errors`,
    };

    console.log("[BACKFILL] Summary:", summary);
    return summary;
  },
});

/**
 * Check backfill status - see how many users still need lead captures
 */
export const checkBackfillStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    const allLeads = await ctx.db.query("leadCaptures").collect();

    // Count users with and without lead captures
    let usersWithLeads = 0;
    let usersWithoutLeads = 0;

    for (const user of allUsers) {
      const lead = await ctx.db
        .query("leadCaptures")
        .withIndex("by_email", (q) => q.eq("email", user.email))
        .first();

      if (lead) {
        usersWithLeads++;
      } else {
        usersWithoutLeads++;
      }
    }

    return {
      totalUsers: allUsers.length,
      totalLeads: allLeads.length,
      usersWithLeads,
      usersWithoutLeads,
      needsBackfill: usersWithoutLeads > 0,
    };
  },
});
