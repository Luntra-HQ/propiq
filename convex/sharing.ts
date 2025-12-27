/**
 * Sharing functionality for PropIQ
 * Enables public sharing of property analyses
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Generate a unique share token
 * Format: 10 alphanumeric characters (e.g., "a1B2c3D4e5")
 */
function generateShareToken(): string {
  const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 10; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

/**
 * Generate a shareable link for an analysis
 * Creates a unique token and sets the analysis to public
 */
export const generateShareLink = mutation({
  args: {
    analysisId: v.id("propertyAnalyses"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get the analysis
    const analysis = await ctx.db.get(args.analysisId);

    if (!analysis) {
      throw new Error("Analysis not found");
    }

    // Verify ownership
    if (analysis.userId !== args.userId) {
      throw new Error("You can only share your own analyses");
    }

    // If already has a share token, return existing link
    if (analysis.shareToken && analysis.isPublic) {
      return {
        success: true,
        shareToken: analysis.shareToken,
        url: `https://propiq.luntra.one/a/${analysis.shareToken}`,
        isNew: false,
      };
    }

    // Generate unique token
    let shareToken = generateShareToken();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure token is unique
    while (attempts < maxAttempts) {
      const existing = await ctx.db
        .query("propertyAnalyses")
        .withIndex("by_share_token", (q) => q.eq("shareToken", shareToken))
        .first();

      if (!existing) {
        break; // Token is unique
      }

      shareToken = generateShareToken();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error("Failed to generate unique share token");
    }

    // Update analysis with share token
    await ctx.db.patch(args.analysisId, {
      shareToken,
      isPublic: true,
      shareCreatedAt: Date.now(),
    });

    console.log(`[SHARING] Generated share link for analysis ${args.analysisId}: ${shareToken}`);

    return {
      success: true,
      shareToken,
      url: `https://propiq.luntra.one/a/${shareToken}`,
      isNew: true,
    };
  },
});

/**
 * Get public analysis by share token
 * Returns analysis data without user personal info
 */
export const getPublicAnalysis = query({
  args: {
    shareToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Find analysis by share token
    const analysis = await ctx.db
      .query("propertyAnalyses")
      .withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
      .first();

    if (!analysis) {
      return { found: false, analysis: null };
    }

    // Check if public
    if (!analysis.isPublic) {
      return { found: false, analysis: null };
    }

    // Return analysis without user personal info
    return {
      found: true,
      analysis: {
        address: analysis.address,
        city: analysis.city,
        state: analysis.state,
        zipCode: analysis.zipCode,
        purchasePrice: analysis.purchasePrice,
        downPayment: analysis.downPayment,
        monthlyRent: analysis.monthlyRent,
        analysisResult: analysis.analysisResult,
        aiRecommendation: analysis.aiRecommendation,
        dealScore: analysis.dealScore,
        createdAt: analysis.createdAt,
      },
    };
  },
});

/**
 * Toggle public sharing on/off for an analysis
 */
export const togglePublicSharing = mutation({
  args: {
    analysisId: v.id("propertyAnalyses"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.analysisId);

    if (!analysis) {
      throw new Error("Analysis not found");
    }

    // Verify ownership
    if (analysis.userId !== args.userId) {
      throw new Error("You can only modify your own analyses");
    }

    const newPublicState = !analysis.isPublic;

    await ctx.db.patch(args.analysisId, {
      isPublic: newPublicState,
    });

    console.log(`[SHARING] Toggled public sharing for analysis ${args.analysisId}: ${newPublicState}`);

    return {
      success: true,
      isPublic: newPublicState,
    };
  },
});

/**
 * Revoke share link for an analysis
 * Sets isPublic to false and clears share token
 */
export const revokeShareLink = mutation({
  args: {
    analysisId: v.id("propertyAnalyses"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.analysisId);

    if (!analysis) {
      throw new Error("Analysis not found");
    }

    // Verify ownership
    if (analysis.userId !== args.userId) {
      throw new Error("You can only modify your own analyses");
    }

    // Clear sharing fields
    await ctx.db.patch(args.analysisId, {
      isPublic: false,
      shareToken: undefined,
      shareCreatedAt: undefined,
    });

    console.log(`[SHARING] Revoked share link for analysis ${args.analysisId}`);

    return {
      success: true,
      message: "Share link has been revoked",
    };
  },
});

/**
 * Get all shared analyses for a user
 * Returns list of user's analyses that have share links
 */
export const getUserSharedAnalyses = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const analyses = await ctx.db
      .query("propertyAnalyses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Filter to only shared analyses
    const sharedAnalyses = analyses
      .filter((a) => a.isPublic && a.shareToken)
      .map((a) => ({
        _id: a._id,
        address: a.address,
        dealScore: a.dealScore,
        shareToken: a.shareToken,
        shareCreatedAt: a.shareCreatedAt,
        createdAt: a.createdAt,
        url: `https://propiq.luntra.one/a/${a.shareToken}`,
      }));

    return sharedAnalyses;
  },
});
