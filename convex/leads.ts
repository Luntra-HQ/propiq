/**
 * Lead Capture and Nurture System
 *
 * Manages the complete lead lifecycle:
 * 1. Capture - User downloads lead magnet
 * 2. Nurture - Automated email sequence (Day 3, Day 7)
 * 3. Convert - User signs up for trial or paid plan
 * 4. Analytics - Track conversion funnel metrics
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Capture a new lead from lead magnet download
 * Called by Formspree webhook or landing page form
 */
export const captureLead = mutation({
  args: {
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    leadMagnetType: v.string(),
    source: v.optional(v.string()),
    // UTM parameters for attribution
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    utmContent: v.optional(v.string()),
    utmTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const now = Date.now();

    // Check if lead already exists
    const existingLead = await ctx.db
      .query("leadCaptures")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingLead) {
      console.log(`[LEADS] Lead already captured: ${email}`);

      // Update last engagement time
      await ctx.db.patch(existingLead._id, {
        lastEngagementAt: now,
        updatedAt: now,
      });

      return {
        success: true,
        leadId: existingLead._id,
        message: "Lead already exists, updated engagement time",
      };
    }

    // Create new lead capture
    const leadId = await ctx.db.insert("leadCaptures", {
      email,
      firstName: args.firstName,
      lastName: args.lastName,
      leadMagnetType: args.leadMagnetType,
      source: args.source || "unknown",
      utmSource: args.utmSource,
      utmMedium: args.utmMedium,
      utmCampaign: args.utmCampaign,
      utmContent: args.utmContent,
      utmTerm: args.utmTerm,
      status: "captured",
      userId: undefined,
      convertedAt: undefined,
      day3EmailSent: false,
      day3EmailSentAt: undefined,
      day7EmailSent: false,
      day7EmailSentAt: undefined,
      emailOpened: false,
      emailClicked: false,
      lastEngagementAt: now,
      capturedAt: now,
      updatedAt: now,
    });

    console.log(`[LEADS] New lead captured: ${email} (${args.leadMagnetType})`);

    return {
      success: true,
      leadId,
      message: "Lead captured successfully",
    };
  },
});

/**
 * Convert a lead to trial user (called during signup)
 * Links the lead capture to the user account
 */
export const convertLeadToTrial = mutation({
  args: {
    email: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const now = Date.now();

    // Find lead capture by email
    const lead = await ctx.db
      .query("leadCaptures")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!lead) {
      console.log(`[LEADS] No lead found for conversion: ${email}`);
      return {
        success: false,
        message: "No lead found for this email",
      };
    }

    // Don't update if already converted
    if (lead.status === "converted_trial" || lead.status === "converted_paid") {
      console.log(`[LEADS] Lead already converted: ${email} (${lead.status})`);
      return {
        success: true,
        message: "Lead already converted",
        leadId: lead._id,
      };
    }

    // Update lead status to converted_trial
    await ctx.db.patch(lead._id, {
      status: "converted_trial",
      userId: args.userId,
      convertedAt: now,
      updatedAt: now,
    });

    console.log(`[LEADS] Lead converted to trial: ${email} → User ${args.userId}`);

    return {
      success: true,
      message: "Lead converted to trial",
      leadId: lead._id,
    };
  },
});

/**
 * Convert a lead to paid user (called when they subscribe)
 */
export const convertLeadToPaid = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find lead by userId
    const lead = await ctx.db
      .query("leadCaptures")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!lead) {
      console.log(`[LEADS] No lead found for user: ${args.userId}`);
      return {
        success: false,
        message: "No lead found for this user",
      };
    }

    // Update to paid
    await ctx.db.patch(lead._id, {
      status: "converted_paid",
      convertedAt: now,
      updatedAt: now,
    });

    console.log(`[LEADS] Lead converted to paid: ${lead.email}`);

    return {
      success: true,
      message: "Lead converted to paid",
      leadId: lead._id,
    };
  },
});

/**
 * Mark Day 3 nurture email as sent
 * Called by email scheduler
 */
export const markDay3EmailSent = internalMutation({
  args: {
    leadId: v.id("leadCaptures"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.patch(args.leadId, {
      day3EmailSent: true,
      day3EmailSentAt: now,
      status: "nurtured_day3",
      updatedAt: now,
    });

    console.log(`[LEADS] Day 3 email marked as sent: ${args.leadId}`);
  },
});

/**
 * Mark Day 7 nurture email as sent
 * Called by email scheduler
 */
export const markDay7EmailSent = internalMutation({
  args: {
    leadId: v.id("leadCaptures"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.patch(args.leadId, {
      day7EmailSent: true,
      day7EmailSentAt: now,
      status: "nurtured_day7",
      updatedAt: now,
    });

    console.log(`[LEADS] Day 7 email marked as sent: ${args.leadId}`);
  },
});

/**
 * Get lead statistics for analytics dashboard
 */
export const getLeadStats = query({
  args: {},
  handler: async (ctx) => {
    const allLeads = await ctx.db.query("leadCaptures").collect();

    const stats = {
      total: allLeads.length,
      captured: 0,
      nurturedDay3: 0,
      nurturedDay7: 0,
      convertedTrial: 0,
      convertedPaid: 0,
      conversionRate: 0,
    };

    allLeads.forEach((lead) => {
      if (lead.status === "captured") stats.captured++;
      else if (lead.status === "nurtured_day3") stats.nurturedDay3++;
      else if (lead.status === "nurtured_day7") stats.nurturedDay7++;
      else if (lead.status === "converted_trial") stats.convertedTrial++;
      else if (lead.status === "converted_paid") stats.convertedPaid++;
    });

    // Calculate conversion rate (trial + paid / total)
    const converted = stats.convertedTrial + stats.convertedPaid;
    stats.conversionRate = stats.total > 0
      ? Math.round((converted / stats.total) * 100)
      : 0;

    return stats;
  },
});

/**
 * Get recent leads for admin dashboard
 */
export const getRecentLeads = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const leads = await ctx.db
      .query("leadCaptures")
      .withIndex("by_captured_date")
      .order("desc")
      .take(limit);

    return leads.map((lead) => ({
      id: lead._id,
      email: lead.email,
      firstName: lead.firstName,
      lastName: lead.lastName,
      status: lead.status,
      leadMagnetType: lead.leadMagnetType,
      source: lead.source,
      capturedAt: lead.capturedAt,
      day3EmailSent: lead.day3EmailSent,
      day7EmailSent: lead.day7EmailSent,
    }));
  },
});

/**
 * Get leads eligible for Day 3 nurture email
 * Internal function called by cron job
 */
export const getLeadsForDay3Nurture = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);
    const fourDaysAgo = now - (4 * 24 * 60 * 60 * 1000);

    // Get leads that:
    // 1. Were captured 3 days ago (within 24-hour window)
    // 2. Haven't received Day 3 email yet
    // 3. Haven't converted to trial or paid
    const leads = await ctx.db
      .query("leadCaptures")
      .withIndex("by_status", (q) => q.eq("status", "captured"))
      .filter((q) =>
        q.and(
          q.eq(q.field("day3EmailSent"), false),
          q.gte(q.field("capturedAt"), fourDaysAgo),
          q.lte(q.field("capturedAt"), threeDaysAgo)
        )
      )
      .collect();

    console.log(`[LEADS] Found ${leads.length} leads eligible for Day 3 nurture`);

    return leads;
  },
});

/**
 * Get leads eligible for Day 7 nurture email
 * Internal function called by cron job
 */
export const getLeadsForDay7Nurture = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    const eightDaysAgo = now - (8 * 24 * 60 * 60 * 1000);

    // Get leads that:
    // 1. Were captured 7 days ago (within 24-hour window)
    // 2. Haven't received Day 7 email yet
    // 3. Haven't converted to trial or paid
    const leads = await ctx.db
      .query("leadCaptures")
      .filter((q) =>
        q.and(
          q.eq(q.field("day7EmailSent"), false),
          q.or(
            q.eq(q.field("status"), "captured"),
            q.eq(q.field("status"), "nurtured_day3")
          ),
          q.gte(q.field("capturedAt"), eightDaysAgo),
          q.lte(q.field("capturedAt"), sevenDaysAgo)
        )
      )
      .collect();

    console.log(`[LEADS] Found ${leads.length} leads eligible for Day 7 nurture`);

    return leads;
  },
});

/**
 * Get lead conversion funnel metrics
 */
export const getConversionFunnel = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);

    const leads = await ctx.db
      .query("leadCaptures")
      .filter((q) => q.gte(q.field("capturedAt"), cutoffTime))
      .collect();

    const funnel = {
      captured: 0,
      day3Sent: 0,
      day7Sent: 0,
      trialConversions: 0,
      paidConversions: 0,
      captureToTrialRate: 0,
      trialToPaidRate: 0,
    };

    leads.forEach((lead) => {
      funnel.captured++;
      if (lead.day3EmailSent) funnel.day3Sent++;
      if (lead.day7EmailSent) funnel.day7Sent++;
      if (lead.status === "converted_trial" || lead.status === "converted_paid") {
        funnel.trialConversions++;
      }
      if (lead.status === "converted_paid") {
        funnel.paidConversions++;
      }
    });

    // Calculate conversion rates
    if (funnel.captured > 0) {
      funnel.captureToTrialRate = Math.round((funnel.trialConversions / funnel.captured) * 100);
    }
    if (funnel.trialConversions > 0) {
      funnel.trialToPaidRate = Math.round((funnel.paidConversions / funnel.trialConversions) * 100);
    }

    return {
      period: `Last ${days} days`,
      ...funnel,
    };
  },
});
