/**
 * Convex functions for user onboarding progress tracking
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's onboarding progress
export const getProgress = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("onboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Return default progress if none exists
    if (!progress) {
      return {
        userId: args.userId,
        analyzedFirstProperty: false,
        exploredCalculator: false,
        triedScenarios: false,
        readKeyMetricsArticle: false,
        setInvestmentCriteria: false,
        exportedReport: false,
        analyzedThreeProperties: false,
        completedProductTour: false,
        tourStep: 0,
        checklistDismissed: false,
        checklistCompletedAt: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    return progress;
  },
});

// Update a single onboarding task
export const updateTask = mutation({
  args: {
    userId: v.id("users"),
    task: v.string(),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("onboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (!progress) {
      // Create new progress record
      await ctx.db.insert("onboardingProgress", {
        userId: args.userId,
        analyzedFirstProperty: args.task === "analyzedFirstProperty" ? args.completed : false,
        exploredCalculator: args.task === "exploredCalculator" ? args.completed : false,
        triedScenarios: args.task === "triedScenarios" ? args.completed : false,
        readKeyMetricsArticle: args.task === "readKeyMetricsArticle" ? args.completed : false,
        setInvestmentCriteria: args.task === "setInvestmentCriteria" ? args.completed : false,
        exportedReport: args.task === "exportedReport" ? args.completed : false,
        analyzedThreeProperties: args.task === "analyzedThreeProperties" ? args.completed : false,
        completedProductTour: args.task === "completedProductTour" ? args.completed : false,
        tourStep: 0,
        checklistDismissed: false,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      // Update existing progress
      const updates: any = {
        updatedAt: now,
      };
      updates[args.task] = args.completed;

      // Check if all tasks are complete
      const allTasks = [
        "analyzedFirstProperty",
        "exploredCalculator",
        "triedScenarios",
        "readKeyMetricsArticle",
        "setInvestmentCriteria",
        "exportedReport",
        "analyzedThreeProperties",
      ];

      const allComplete = allTasks.every(task =>
        task === args.task ? args.completed : (progress as any)[task]
      );

      if (allComplete && !progress.checklistCompletedAt) {
        updates.checklistCompletedAt = now;
      }

      await ctx.db.patch(progress._id, updates);
    }

    return { success: true };
  },
});

// Dismiss checklist
export const dismissChecklist = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("onboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (!progress) {
      await ctx.db.insert("onboardingProgress", {
        userId: args.userId,
        analyzedFirstProperty: false,
        exploredCalculator: false,
        triedScenarios: false,
        readKeyMetricsArticle: false,
        setInvestmentCriteria: false,
        exportedReport: false,
        analyzedThreeProperties: false,
        completedProductTour: false,
        tourStep: 0,
        checklistDismissed: true,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(progress._id, {
        checklistDismissed: true,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Update product tour progress
export const updateTourProgress = mutation({
  args: {
    userId: v.id("users"),
    step: v.number(),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("onboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (!progress) {
      await ctx.db.insert("onboardingProgress", {
        userId: args.userId,
        analyzedFirstProperty: false,
        exploredCalculator: false,
        triedScenarios: false,
        readKeyMetricsArticle: false,
        setInvestmentCriteria: false,
        exportedReport: false,
        analyzedThreeProperties: false,
        completedProductTour: args.completed,
        tourStep: args.step,
        checklistDismissed: false,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(progress._id, {
        completedProductTour: args.completed,
        tourStep: args.step,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Get onboarding completion percentage
export const getCompletionPercentage = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("onboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!progress) {
      return 0;
    }

    const tasks = [
      progress.analyzedFirstProperty,
      progress.exploredCalculator,
      progress.triedScenarios,
      progress.readKeyMetricsArticle,
      progress.setInvestmentCriteria,
      progress.exportedReport,
      progress.analyzedThreeProperties,
    ];

    const completed = tasks.filter(Boolean).length;
    const total = tasks.length;

    return Math.round((completed / total) * 100);
  },
});
