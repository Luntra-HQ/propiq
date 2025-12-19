/**
 * Property analysis functions for PropIQ
 * AI-powered real estate investment analysis
 */

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

type MarketTrend = "up" | "down" | "stable";
type Recommendation = "strong_buy" | "buy" | "hold" | "avoid";
type RiskLevel = "low" | "medium" | "high";
type TimeHorizon = "short" | "medium" | "long";

type NormalizedAnalysis = {
  summary: string;
  location: {
    neighborhood: string;
    city: string;
    state: string;
    marketTrend: MarketTrend;
    marketScore: number;
  };
  financials: {
    estimatedValue: number;
    estimatedRent: number;
    cashFlow: number;
    capRate: number;
    roi: number;
    monthlyMortgage: number;
  };
  investment: {
    recommendation: Recommendation;
    confidenceScore: number;
    riskLevel: RiskLevel;
    timeHorizon: TimeHorizon;
  };
  pros: string[];
  cons: string[];
  keyInsights: string[];
  nextSteps: string[];
  _metadata?: {
    address: string;
    analyzedAt: string;
    analyzedBy: string;
    model: string;
  };
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toStringValue(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
}

function toStringArray(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const out = value
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter((v) => v.length > 0);
    return out.length > 0 ? out : fallback;
  }
  return fallback;
}

function normalizeEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  const v = typeof value === "string" ? value.toLowerCase().trim() : "";
  const match = allowed.find((a) => a === (v as T));
  return match ?? fallback;
}

function normalizeRecommendation(value: unknown): Recommendation {
  const v = typeof value === "string" ? value.toLowerCase().trim() : "";
  // Handle common variants from LLMs
  if (v === "strong buy" || v === "strong_buy" || v === "strongbuy") return "strong_buy";
  if (v === "buy") return "buy";
  if (v === "hold" || v === "consider") return "hold";
  if (v === "avoid" || v === "no") return "avoid";
  return "hold";
}

function parseCityStateFromAddress(address: string): { city?: string; state?: string } {
  // Very lightweight parser: "street, City, ST 12345"
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return {};
  const city = parts[1];
  const last = parts[2] || "";
  const m = last.match(/\b([A-Z]{2})\b/);
  const state = m ? m[1] : undefined;
  return { city, state };
}

function normalizeAnalysisShape(raw: any, propertyData: { address: string; city?: string; state?: string; purchasePrice?: number; monthlyRent?: number; }): NormalizedAnalysis {
  const inferred = parseCityStateFromAddress(propertyData.address);
  const city = propertyData.city || inferred.city || "Unknown";
  const state = propertyData.state || inferred.state || "Unknown";

  const rawLocation = raw?.location ?? raw?.market ?? raw?.area ?? {};
  const rawFinancials = raw?.financials ?? raw?.numbers ?? raw?.metrics ?? {};
  const rawInvestment = raw?.investment ?? raw?.recommendation ?? raw?.decision ?? {};

  const summary =
    toStringValue(raw?.summary, "") ||
    toStringValue(raw?.executiveSummary, "") ||
    toStringValue(raw?.overview, "") ||
    "Analysis completed. Review the details below.";

  const marketTrend = normalizeEnum<MarketTrend>(
    rawLocation?.marketTrend,
    ["up", "down", "stable"] as const,
    "stable"
  );

  const normalized: NormalizedAnalysis = {
    summary,
    location: {
      neighborhood: toStringValue(rawLocation?.neighborhood, "Unknown"),
      city: toStringValue(rawLocation?.city, city),
      state: toStringValue(rawLocation?.state, state),
      marketTrend,
      marketScore: clamp(toNumber(rawLocation?.marketScore, 50), 0, 100),
    },
    financials: {
      estimatedValue: toNumber(rawFinancials?.estimatedValue, propertyData.purchasePrice || 0),
      estimatedRent: toNumber(rawFinancials?.estimatedRent, propertyData.monthlyRent || 0),
      cashFlow: toNumber(rawFinancials?.cashFlow, 0),
      capRate: toNumber(rawFinancials?.capRate, 0),
      roi: toNumber(rawFinancials?.roi, 0),
      monthlyMortgage: toNumber(rawFinancials?.monthlyMortgage, 0),
    },
    investment: {
      recommendation: normalizeRecommendation(rawInvestment?.recommendation ?? raw?.recommendation),
      confidenceScore: clamp(toNumber(rawInvestment?.confidenceScore, raw?.confidenceScore ?? 60), 0, 100),
      riskLevel: normalizeEnum<RiskLevel>(
        rawInvestment?.riskLevel,
        ["low", "medium", "high"] as const,
        "medium"
      ),
      timeHorizon: normalizeEnum<TimeHorizon>(
        rawInvestment?.timeHorizon,
        ["short", "medium", "long"] as const,
        "medium"
      ),
    },
    pros: toStringArray(raw?.pros ?? raw?.strengths, ["No major strengths identified."]),
    cons: toStringArray(raw?.cons ?? raw?.risks, ["No major risks identified."]),
    keyInsights: toStringArray(raw?.keyInsights ?? raw?.insights, ["Review key metrics and market context."]),
    nextSteps: toStringArray(raw?.nextSteps ?? raw?.actions, ["Verify comps and run a detailed underwriting."]),
    _metadata: {
      address: propertyData.address,
      analyzedAt: new Date().toISOString(),
      analyzedBy: "azure-openai",
      model: process.env.AZURE_OPENAI_DEPLOYMENT || "unknown",
    },
  };

  // Final hard guarantees so frontend never crashes:
  if (!normalized.location) {
    (normalized as any).location = {
      neighborhood: "Unknown",
      city,
      state,
      marketTrend: "stable",
      marketScore: 50,
    };
  }
  if (!normalized.location.neighborhood) normalized.location.neighborhood = "Unknown";

  return normalized;
}

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
  const prompt = `You are an expert real estate investment analyst.
You MUST return ONLY valid JSON (no markdown, no commentary) and you MUST include ALL fields listed in the schema.
If you are uncertain, use reasonable defaults but still include the field.

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
    "city": "${propertyData.city || "Unknown"}",
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
      const errorText = await response.text().catch(() => "");
      console.error("[PropIQ] Azure OpenAI non-200 response:", {
        status: response.status,
        statusText: response.statusText,
        bodyPreview: errorText.slice(0, 500),
      });
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data?.choices?.[0]?.message?.content;

    // Log what Azure OpenAI actually returned (truncated to avoid huge logs)
    console.log("[PropIQ] Azure OpenAI raw content (preview):", {
      length: typeof analysisText === "string" ? analysisText.length : null,
      preview: typeof analysisText === "string" ? analysisText.slice(0, 800) : String(analysisText),
    });

    let parsed: any = {};
    try {
      parsed = typeof analysisText === "string" ? JSON.parse(analysisText) : {};
    } catch (e) {
      console.error("[PropIQ] Failed to parse Azure JSON. Returning normalized fallback.", e);
      parsed = {};
    }

    // Enforce exact shape expected by frontend (prevents `location` undefined crashes)
    const normalized = normalizeAnalysisShape(parsed, propertyData);

    // Log missing fields (high-signal debug)
    const missing: string[] = [];
    if (!normalized.summary) missing.push("summary");
    if (!normalized.location) missing.push("location");
    if (!normalized.location?.neighborhood) missing.push("location.neighborhood");
    if (!normalized.financials) missing.push("financials");
    if (!normalized.investment) missing.push("investment");
    if (missing.length) {
      console.warn("[PropIQ] Normalization filled missing fields:", missing);
    }

    return {
      analysis: normalized,
      recommendation: normalized.investment.recommendation,
      dealScore: clamp(
        toNumber((parsed as any)?.dealScore, normalized.investment.confidenceScore || 50),
        0,
        100
      ),
      tokensUsed: data.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error("AI analysis error:", error);

    // Return fallback analysis if AI fails
    return {
      analysis: normalizeAnalysisShape(
        {
          summary:
            "Property analysis is temporarily unavailable. Please try again later or contact support.",
          pros: ["Property requires manual review"],
          cons: ["AI analysis temporarily unavailable"],
          keyInsights: ["Please try again in a few moments"],
          nextSteps: ["Contact support if this issue persists"],
          investment: { recommendation: "hold", confidenceScore: 50, riskLevel: "medium", timeHorizon: "medium" },
          location: { neighborhood: "Unknown", city: propertyData.city, state: propertyData.state, marketTrend: "stable", marketScore: 50 },
          financials: { estimatedValue: propertyData.purchasePrice, estimatedRent: propertyData.monthlyRent, cashFlow: 0, capRate: 0, roi: 0, monthlyMortgage: 0 },
        },
        propertyData
      ),
      recommendation: "hold",
      dealScore: 50,
      tokensUsed: 0,
    };
  }
}
