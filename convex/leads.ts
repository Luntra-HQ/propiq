/**
 * Lead Capture and Conversion System
 * Manages email collection before trial signup
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Capture a new lead from lead magnet landing page
 */
export const captureLead = mutation({
  args: {
    email: v.string(),
    firstName: v.optional(v.string()),
    leadMagnet: v.string(), // e.g., "due-diligence-checklist"
    source: v.string(), // e.g., "landing-page", "exit-intent", "blog-popup"
    utm_source: v.optional(v.string()),
    utm_medium: v.optional(v.string()),
    utm_campaign: v.optional(v.string()),
    utm_content: v.optional(v.string()),
    utm_term: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { email, firstName, leadMagnet, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term } = args;

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if this email already exists in leadCaptures
    const existingLead = await ctx.db
      .query("leadCaptures")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (existingLead) {
      // Lead already exists - update source and timestamp but don't duplicate
      await ctx.db.patch(existingLead._id, {
        source, // Update to latest source
        leadMagnet, // Update to latest lead magnet
        capturedAt: Date.now(), // Update timestamp
        // Update UTM params if provided
        ...(utm_source && { utm_source }),
        ...(utm_medium && { utm_medium }),
        ...(utm_campaign && { utm_campaign }),
        ...(utm_content && { utm_content }),
        ...(utm_term && { utm_term }),
      });

      return {
        success: true,
        isNew: false,
        leadId: existingLead._id,
        message: "Lead already exists, updated with new source",
      };
    }

    // Check if this email is already a registered user
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (existingUser) {
      // User already exists - create lead record but link to user
      const leadId = await ctx.db.insert("leadCaptures", {
        email: normalizedEmail,
        firstName,
        leadMagnet,
        source,
        status: "converted_trial", // Already converted
        userId: existingUser._id,
        convertedAt: Date.now(),
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        capturedAt: Date.now(),
      });

      return {
        success: true,
        isNew: true,
        leadId,
        message: "Lead created and linked to existing user",
        alreadyUser: true,
      };
    }

    // Create new lead capture
    const leadId = await ctx.db.insert("leadCaptures", {
      email: normalizedEmail,
      firstName,
      leadMagnet,
      source,
      status: "captured",
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      capturedAt: Date.now(),
    });

    return {
      success: true,
      isNew: true,
      leadId,
      message: "Lead captured successfully",
    };
  },
});

/**
 * Get lead by email - check if email exists in leads or users
 */
export const getLeadByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.toLowerCase().trim();

    // Check leadCaptures first
    const lead = await ctx.db
      .query("leadCaptures")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (lead) {
      return {
        exists: true,
        type: "lead",
        status: lead.status,
        capturedAt: lead.capturedAt,
        leadMagnet: lead.leadMagnet,
      };
    }

    // Check users table
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (user) {
      return {
        exists: true,
        type: "user",
        subscriptionTier: user.subscriptionTier,
        createdAt: user.createdAt,
      };
    }

    return {
      exists: false,
    };
  },
});

/**
 * Convert lead to trial when they sign up
 */
export const convertLeadToTrial = mutation({
  args: {
    email: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.toLowerCase().trim();

    // Find the lead
    const lead = await ctx.db
      .query("leadCaptures")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (!lead) {
      // No lead found - user signed up directly without going through lead magnet
      return {
        success: false,
        message: "No lead found for this email",
      };
    }

    // Update lead status to converted
    await ctx.db.patch(lead._id, {
      status: "converted_trial",
      userId: args.userId,
      convertedAt: Date.now(),
    });

    return {
      success: true,
      leadId: lead._id,
      message: "Lead converted to trial",
      capturedAt: lead.capturedAt,
      convertedAt: Date.now(),
      timeToConvert: Date.now() - lead.capturedAt,
    };
  },
});

/**
 * Convert trial user to paid (update lead status)
 */
export const convertLeadToPaid = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Find lead by userId
    const lead = await ctx.db
      .query("leadCaptures")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!lead) {
      return {
        success: false,
        message: "No lead found for this user",
      };
    }

    // Update status to converted_paid
    await ctx.db.patch(lead._id, {
      status: "converted_paid",
      convertedAt: Date.now(), // Update conversion time to paid conversion
    });

    return {
      success: true,
      leadId: lead._id,
      message: "Lead converted to paid",
    };
  },
});

/**
 * Get lead statistics for analytics
 */
export const getLeadStats = query({
  args: {},
  handler: async (ctx) => {
    // Get all leads
    const allLeads = await ctx.db.query("leadCaptures").collect();

    // Count by status
    const statusCounts = {
      captured: 0,
      nurtured: 0,
      converted_trial: 0,
      converted_paid: 0,
    };

    allLeads.forEach((lead) => {
      if (lead.status in statusCounts) {
        statusCounts[lead.status as keyof typeof statusCounts]++;
      }
    });

    // Count by source
    const sourceCounts: Record<string, number> = {};
    allLeads.forEach((lead) => {
      sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1;
    });

    // Count by lead magnet
    const leadMagnetCounts: Record<string, number> = {};
    allLeads.forEach((lead) => {
      leadMagnetCounts[lead.leadMagnet] = (leadMagnetCounts[lead.leadMagnet] || 0) + 1;
    });

    // Calculate conversion rates
    const totalLeads = allLeads.length;
    const trialConversions = statusCounts.converted_trial + statusCounts.converted_paid;
    const paidConversions = statusCounts.converted_paid;

    const trialConversionRate = totalLeads > 0 ? (trialConversions / totalLeads) * 100 : 0;
    const paidConversionRate = totalLeads > 0 ? (paidConversions / totalLeads) * 100 : 0;

    // Get leads from last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const last7DaysLeads = allLeads.filter((lead) => lead.capturedAt >= sevenDaysAgo);

    // Get leads from last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const last30DaysLeads = allLeads.filter((lead) => lead.capturedAt >= thirtyDaysAgo);

    return {
      total: totalLeads,
      byStatus: statusCounts,
      bySource: sourceCounts,
      byLeadMagnet: leadMagnetCounts,
      conversionRates: {
        toTrial: trialConversionRate,
        toPaid: paidConversionRate,
      },
      recentLeads: {
        last7Days: last7DaysLeads.length,
        last30Days: last30DaysLeads.length,
      },
    };
  },
});

/**
 * Get recent leads (for admin dashboard)
 */
export const getRecentLeads = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const leads = await ctx.db
      .query("leadCaptures")
      .withIndex("by_captured_date")
      .order("desc")
      .take(limit);

    return leads;
  },
});

/**
 * Mark nurture email as sent
 */
export const markNurtureEmailSent = mutation({
  args: {
    leadId: v.id("leadCaptures"),
    day: v.union(v.literal(3), v.literal(7)),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    if (args.day === 3) {
      await ctx.db.patch(args.leadId, {
        day3EmailSent: true,
        day3EmailSentAt: Date.now(),
      });
    } else {
      await ctx.db.patch(args.leadId, {
        day7EmailSent: true,
        day7EmailSentAt: Date.now(),
      });
    }

    // Update status to nurtured if still in captured state
    if (lead.status === "captured") {
      await ctx.db.patch(args.leadId, {
        status: "nurtured",
      });
    }

    return { success: true };
  },
});

/**
 * Get leads eligible for nurture emails
 */
export const getLeadsForNurture = query({
  args: { day: v.union(v.literal(3), v.literal(7)) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const daysInMs = args.day * 24 * 60 * 60 * 1000;
    const targetTime = now - daysInMs;

    // Get all leads captured around target time (within 1 hour window)
    const leads = await ctx.db
      .query("leadCaptures")
      .withIndex("by_captured_date")
      .collect();

    // Filter for leads that:
    // 1. Were captured ~3 or ~7 days ago (within 1 hour)
    // 2. Haven't had this nurture email sent yet
    // 3. Haven't converted yet
    const eligibleLeads = leads.filter((lead) => {
      // Check if converted - skip if converted
      if (lead.status === "converted_trial" || lead.status === "converted_paid") {
        return false;
      }

      // Check if already sent this nurture email
      if (args.day === 3 && lead.day3EmailSent) {
        return false;
      }
      if (args.day === 7 && lead.day7EmailSent) {
        return false;
      }

      // Check if captured at the right time (within 1 hour of target)
      const hourInMs = 60 * 60 * 1000;
      const timeSinceCapture = now - lead.capturedAt;
      return Math.abs(timeSinceCapture - daysInMs) < hourInMs;
    });

    return eligibleLeads;
  },
});
