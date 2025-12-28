/**
 * NPS (Net Promoter Score) Survey
 * Captures user satisfaction and feedback
 */

import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Submit NPS survey response
 */
export const submitResponse = mutation({
  args: {
    userId: v.id("users"),
    score: v.number(), // 0-10
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate score range
    if (args.score < 0 || args.score > 10) {
      throw new Error("NPS score must be between 0 and 10");
    }

    // Calculate NPS category
    let category: "detractor" | "passive" | "promoter";
    if (args.score <= 6) {
      category = "detractor";
    } else if (args.score <= 8) {
      category = "passive";
    } else {
      category = "promoter";
    }

    // Insert NPS response
    const npsId = await ctx.db.insert("npsResponses", {
      userId: args.userId,
      score: args.score,
      category,
      comment: args.comment || "",
      respondedAt: Date.now(),
      source: "settings_page",
    });

    console.log(`[NPS] User ${args.userId} submitted score ${args.score} (${category})`);

    return {
      success: true,
      npsId,
      category,
    };
  },
});

/**
 * Get NPS statistics (admin only)
 */
export const getStats = mutation({
  args: {},
  handler: async (ctx) => {
    const allResponses = await ctx.db.query("npsResponses").collect();

    if (allResponses.length === 0) {
      return {
        totalResponses: 0,
        npsScore: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
      };
    }

    const promoters = allResponses.filter((r) => r.category === "promoter").length;
    const passives = allResponses.filter((r) => r.category === "passive").length;
    const detractors = allResponses.filter((r) => r.category === "detractor").length;

    // NPS = (% promoters) - (% detractors)
    const npsScore = ((promoters - detractors) / allResponses.length) * 100;

    return {
      totalResponses: allResponses.length,
      npsScore: Math.round(npsScore),
      promoters,
      passives,
      detractors,
    };
  },
});
