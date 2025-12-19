/**
 * Property analysis functions for PropIQ
 * AI-powered real estate investment analysis
 */

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Analyze property - Main analysis function
export const analyzeProperty = action({
  args: {
    userId: v.id("users"),
    address: v.string(),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    purchasePrice: v.optional(v.number()),
    downPayment: v.optional(v.number()),
    monthlyRent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      // Check user's analysis limit
      const user = await ctx.runQuery(api.auth.getUser, { userId: args.userId });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.analysesUsed >= user.analysesLimit) {
        throw new Error(
          `Analysis limit reached. You've used ${user.analysesUsed}/${user.analysesLimit} analyses. Please upgrade your plan.`
        );
      }

      // Call OpenAI for property analysis
      const analysisResult = await generateAIAnalysis(args);

      // Save analysis to database
      const analysisId = await ctx.runMutation(api.propiq.saveAnalysis, {
        userId: args.userId,
        address: args.address,
        city: args.city,
        state: args.state,
        zipCode: args.zipCode,
        purchasePrice: args.purchasePrice,
        downPayment: args.downPayment,
        monthlyRent: args.monthlyRent,
        analysisResult: JSON.stringify(analysisResult.analysis),
        aiRecommendation: analysisResult.recommendation,
        dealScore: analysisResult.dealScore,
        tokensUsed: analysisResult.tokensUsed,
      });

      // Increment user's analyses used count
      await ctx.runMutation(api.propiq.incrementAnalysisCount, { userId: args.userId });

      return {
        success: true,
        analysisId: analysisId.toString(),
        ...analysisResult,
        analysesRemaining: user.analysesLimit - user.analysesUsed - 1,
      };
    } catch (error: any) {
      console.error("[PropIQ] Analysis error:", error);
      throw new Error(`Analysis failed: ${error.message || error}`);
    }
  },
});

// Save analysis to database (mutation)
export const saveAnalysis = mutation({
  args: {
    userId: v.id("users"),
    address: v.string(),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    purchasePrice: v.optional(v.number()),
    downPayment: v.optional(v.number()),
    monthlyRent: v.optional(v.number()),
    analysisResult: v.string(),
    aiRecommendation: v.string(),
    dealScore: v.number(),
    tokensUsed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const analysisId = await ctx.db.insert("propertyAnalyses", {
      userId: args.userId,
      address: args.address,
      city: args.city,
      state: args.state,
      zipCode: args.zipCode,
      purchasePrice: args.purchasePrice,
      downPayment: args.downPayment,
      monthlyRent: args.monthlyRent,
      analysisResult: args.analysisResult,
      aiRecommendation: args.aiRecommendation,
      dealScore: args.dealScore,
      model: "gpt-4o-mini",
      tokensUsed: args.tokensUsed,
      createdAt: Date.now(),
    });

    return analysisId;
  },
});

// Increment user's analysis count
export const incrementAnalysisCount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      analysesUsed: user.analysesUsed + 1,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get user's analysis history
export const getUserAnalyses = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const analyses = await ctx.db
      .query("propertyAnalyses")
      .withIndex("by_user_and_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return analyses.map((analysis) => ({
      ...analysis,
      analysisId: analysis._id.toString(),
      analysisResult: JSON.parse(analysis.analysisResult),
    }));
  },
});

// Get single analysis
export const getAnalysis = query({
  args: { analysisId: v.id("propertyAnalyses") },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.analysisId);

    if (!analysis) {
      return null;
    }

    return {
      ...analysis,
      analysisId: analysis._id.toString(),
      analysisResult: JSON.parse(analysis.analysisResult),
    };
  },
});

// AI Analysis helper function
async function generateAIAnalysis(propertyData: {
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  purchasePrice?: number;
  downPayment?: number;
  monthlyRent?: number;
}): Promise<{
  analysis: any;
  recommendation: string;
  dealScore: number;
  tokensUsed: number;
}> {
  // Get Azure OpenAI credentials from environment
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureKey = process.env.AZURE_OPENAI_KEY;
  const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview";
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";

  if (!azureEndpoint || !azureKey) {
    throw new Error("Azure OpenAI credentials not configured");
  }

  // Build the prompt for AI analysis
  const prompt = `You are an expert real estate investment analyst. Analyze this property and provide comprehensive investment insights.

Property Details:
- Address: ${propertyData.address}${propertyData.city ? `, ${propertyData.city}` : ""}${propertyData.state ? `, ${propertyData.state}` : ""}${propertyData.zipCode ? ` ${propertyData.zipCode}` : ""}
${propertyData.purchasePrice ? `- Purchase Price: $${propertyData.purchasePrice.toLocaleString()}` : ""}
${propertyData.downPayment ? `- Down Payment: $${propertyData.downPayment.toLocaleString()}` : ""}
${propertyData.monthlyRent ? `- Monthly Rent: $${propertyData.monthlyRent.toLocaleString()}` : ""}

Provide a comprehensive analysis in the following JSON structure:
{
  "summary": "Brief 2-3 sentence executive summary of the investment opportunity",
  "location": {
    "neighborhood": "Neighborhood name (estimate based on address)",
    "city": "${propertyData.city || "Unknown City"}",
    "state": "${propertyData.state || "Unknown"}",
    "marketTrend": "up/down/stable (estimate current market trend)",
    "marketScore": 50-100
  },
  "financials": {
    "estimatedValue": ${propertyData.purchasePrice || 300000},
    "estimatedRent": ${propertyData.monthlyRent || 2000},
    "cashFlow": 0,
    "capRate": 5.5,
    "roi": 8.0,
    "monthlyMortgage": 2000
  },
  "investment": {
    "recommendation": "strong_buy/buy/hold/avoid",
    "confidenceScore": 50-100,
    "riskLevel": "low/medium/high",
    "timeHorizon": "short/medium/long"
  },
  "pros": ["3-5 key strengths as bullet points"],
  "cons": ["3-5 key risks as bullet points"],
  "keyInsights": ["3-5 important insights for this investment"],
  "nextSteps": ["3-5 recommended action items"]
}`;

  try {
    // Call Azure OpenAI API
    const azureUrl = `${azureEndpoint}openai/deployments/${azureDeployment}/chat/completions?api-version=${azureApiVersion}`;

    const response = await fetch(azureUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": azureKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are an expert real estate investment analyst. Provide detailed, data-driven investment analysis.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    const analysis = JSON.parse(analysisText);

    return {
      analysis,
      recommendation: analysis.recommendation || "CONSIDER",
      dealScore: analysis.dealScore || 50,
      tokensUsed: data.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error("AI analysis error:", error);

    // Return fallback analysis if AI fails
    return {
      analysis: {
        summary: "Property analysis is temporarily unavailable. Please try again later or contact support.",
        location: {
          neighborhood: "Unknown",
          city: propertyData.city || "Unknown",
          state: propertyData.state || "Unknown",
          marketTrend: "stable" as const,
          marketScore: 50,
        },
        financials: {
          estimatedValue: propertyData.purchasePrice || 0,
          estimatedRent: propertyData.monthlyRent || 0,
          cashFlow: 0,
          capRate: 0,
          roi: 0,
          monthlyMortgage: 0,
        },
        investment: {
          recommendation: "hold" as const,
          confidenceScore: 0,
          riskLevel: "medium" as const,
          timeHorizon: "medium" as const,
        },
        pros: ["Property requires manual review"],
        cons: ["AI analysis temporarily unavailable"],
        keyInsights: ["Please try again in a few moments"],
        nextSteps: ["Contact support if this issue persists"],
      },
      recommendation: "hold",
      dealScore: 50,
      tokensUsed: 0,
    };
  }
}
