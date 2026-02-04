/**
 * Property analysis functions for PropIQ
 * AI-powered real estate investment analysis
 */

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Analyze property - Main analysis function
// 🔒 RACE CONDITION FIX: Uses atomic slot reservation to prevent concurrent requests from bypassing limits
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
    // Image upload integration: Accept images array uploaded to S3
    images: v.optional(v.array(v.object({
      s3Key: v.string(),
      s3Url: v.string(),
      filename: v.string(),
      size: v.number(),
      mimeType: v.string(),
      uploadedAt: v.number(),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
    }))),
  },
  handler: async (ctx, args): Promise<any> => {
    // STEP 1: 🔒 ATOMICALLY reserve analysis slot BEFORE starting expensive operations
    // This prevents race condition where multiple requests bypass the limit check
    let slotReserved = false;
    let reservationResult;

    try {
      reservationResult = await ctx.runMutation(api.propiq.reserveAnalysisSlot, {
        userId: args.userId,
      });
      slotReserved = true;

      console.log(
        `[PropIQ] Analysis slot reserved: ${reservationResult.analysesUsed}/${reservationResult.analysesLimit} used`
      );
    } catch (error: any) {
      // Slot reservation failed (likely limit reached)
      console.error("[PropIQ] Slot reservation failed:", error.message);
      throw error;
    }

    // STEP 2: Generate AI analysis (can fail - if so, we'll refund the slot)
    let analysisResult;
    try {
      analysisResult = await generateAIAnalysis(args);
    } catch (error: any) {
      // AI analysis failed - refund the reserved slot
      console.error("[PropIQ] AI analysis failed:", error.message);

      if (slotReserved) {
        await ctx.runMutation(api.propiq.refundAnalysisSlot, {
          userId: args.userId,
          reason: "ai_analysis_failed",
        });
      }

      throw new Error(`AI analysis failed: ${error.message || error}`);
    }

    // STEP 3: Save analysis to database (can fail - if so, we'll refund the slot)
    let analysisId;
    try {
      analysisId = await ctx.runMutation(api.propiq.saveAnalysis, {
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
        images: args.images || [],  // Pass images to be saved with analysis
      });

      console.log(`[PropIQ] Analysis saved successfully: ${analysisId}`);
    } catch (error: any) {
      // Database save failed - refund the reserved slot
      console.error("[PropIQ] Database save failed:", error.message);

      if (slotReserved) {
        await ctx.runMutation(api.propiq.refundAnalysisSlot, {
          userId: args.userId,
          reason: "database_save_failed",
        });
      }

      throw new Error(`Failed to save analysis: ${error.message || error}`);
    }

    // STEP 4: Success! Return analysis results
    return {
      success: true,
      analysisId: analysisId.toString(),
      ...analysisResult,
      analysesRemaining: reservationResult.analysesRemaining,
    };
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
    // Image upload integration: Accept images array
    images: v.optional(v.array(v.object({
      s3Key: v.string(),
      s3Url: v.string(),
      filename: v.string(),
      size: v.number(),
      mimeType: v.string(),
      uploadedAt: v.number(),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
    }))),
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
      images: args.images || [],  // Save images with analysis
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

// 🔒 ATOMIC: Reserve analysis slot (prevents race condition)
// This mutation checks the limit AND increments the counter in a SINGLE transaction
// This prevents multiple concurrent requests from bypassing the limit
export const reserveAnalysisSlot = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // ATOMIC CHECK + INCREMENT: Both happen in same transaction
    if (user.analysesUsed >= user.analysesLimit) {
      throw new Error(
        `Analysis limit reached. You've used ${user.analysesUsed}/${user.analysesLimit} analyses. Please upgrade your plan.`
      );
    }

    // Immediately increment to reserve the slot
    // This prevents race condition where multiple requests pass the check
    await ctx.db.patch(args.userId, {
      analysesUsed: user.analysesUsed + 1,
      updatedAt: Date.now(),
    });

    const analysesRemaining = user.analysesLimit - user.analysesUsed - 1;

    console.log(
      `[PropIQ] Reserved analysis slot for user ${user.email}: ${user.analysesUsed + 1}/${user.analysesLimit} used (${analysesRemaining} remaining)`
    );

    return {
      success: true,
      analysesUsed: user.analysesUsed + 1,
      analysesLimit: user.analysesLimit,
      analysesRemaining,
    };
  },
});

// 🔄 ROLLBACK: Decrement analysis count (used if analysis fails after reservation)
// This refunds the user's analysis slot if the AI call or save operation fails
export const refundAnalysisSlot = mutation({
  args: {
    userId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Only refund if user has used at least 1 analysis
    if (user.analysesUsed > 0) {
      await ctx.db.patch(args.userId, {
        analysesUsed: user.analysesUsed - 1,
        updatedAt: Date.now(),
      });

      const reason = args.reason || "analysis_failed";
      console.log(
        `[PropIQ] Refunded analysis slot for user ${user.email}: ${user.analysesUsed - 1}/${user.analysesLimit} (reason: ${reason})`
      );

      return {
        success: true,
        analysesUsed: user.analysesUsed - 1,
        analysesLimit: user.analysesLimit,
        message: `Analysis slot refunded (reason: ${reason})`,
      };
    }

    return {
      success: false,
      message: "No analysis to refund",
    };
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

// Save property image metadata after S3 upload
export const savePropertyImage = mutation({
  args: {
    analysisId: v.id("propertyAnalyses"),
    imageData: v.object({
      s3Key: v.string(),
      s3Url: v.string(),
      filename: v.string(),
      size: v.number(),
      mimeType: v.string(),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.analysisId);

    if (!analysis) {
      throw new Error("Analysis not found");
    }

    // Get existing images or initialize empty array
    const currentImages = analysis.images || [];

    // Add new image (limit to 5 images per property)
    if (currentImages.length >= 5) {
      throw new Error("Maximum 5 images per property reached");
    }

    const updatedImages = [
      ...currentImages,
      {
        ...args.imageData,
        uploadedAt: Date.now(),
      },
    ];

    // Update analysis with new image
    await ctx.db.patch(args.analysisId, {
      images: updatedImages,
    });

    console.log(`[PropIQ] Image added to analysis ${args.analysisId}`);

    return { success: true, imageCount: updatedImages.length };
  },
});

// Delete property image
export const deletePropertyImage = mutation({
  args: {
    analysisId: v.id("propertyAnalyses"),
    s3Key: v.string(),
  },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.analysisId);

    if (!analysis) {
      throw new Error("Analysis not found");
    }

    // Remove image from array
    const updatedImages = (analysis.images || []).filter(
      (img) => img.s3Key !== args.s3Key
    );

    await ctx.db.patch(args.analysisId, {
      images: updatedImages,
    });

    console.log(`[PropIQ] Image removed from analysis ${args.analysisId}`);

    return { success: true, imageCount: updatedImages.length };
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
  const LLM_PROVIDER = (process.env.LLM_PROVIDER || "azure").toLowerCase();
  if (LLM_PROVIDER === "bedrock") {
    throw new Error("Bedrock not yet implemented. Set LLM_PROVIDER=azure or unset.");
  }

  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureKey = process.env.AZURE_OPENAI_KEY;
  const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview";
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";

  if (!azureEndpoint || !azureKey) {
    throw new Error("Azure OpenAI credentials not configured");
  }

  // Build the prompt for AI analysis (comprehensive version matching FastAPI quality)
  const prompt = `You are an expert real estate investment analyst. Analyze this property and provide comprehensive investment insights.

PROPERTY DETAILS:
- Address: ${propertyData.address}${propertyData.city ? `, ${propertyData.city}` : ""}${propertyData.state ? `, ${propertyData.state}` : ""}${propertyData.zipCode ? ` ${propertyData.zipCode}` : ""}
${propertyData.purchasePrice ? `- Purchase Price: $${propertyData.purchasePrice.toLocaleString()}` : "- Purchase Price: Not provided (please estimate based on location)"}
${propertyData.downPayment ? `- Down Payment: $${propertyData.downPayment.toLocaleString()}` : ""}
${propertyData.monthlyRent ? `- Monthly Rent: $${propertyData.monthlyRent.toLocaleString()}` : "- Monthly Rent: Not provided (please estimate realistic rent)"}

ANALYSIS REQUIREMENTS:
1. Parse the address to identify neighborhood, city, and state
2. Estimate realistic property value if not provided
3. Calculate all key financial metrics:
   - Cap Rate = Net Operating Income / Purchase Price
   - ROI = Annual Cash Flow / Total Cash Invested
   - Cash Flow = Monthly Rent - (Mortgage + Taxes + Insurance + Maintenance + Vacancy)
4. Provide market context for this specific location
5. Give actionable investment recommendations

MARKET CONTEXT:
- Consider local market conditions (supply/demand, price trends, rental demand)
- Factor in location desirability, school districts, economic indicators
- Assess appreciation potential and market stability

OUTPUT FORMAT (Must be valid JSON):
{
  "summary": "2-3 sentence executive summary with specific numbers and clear recommendation",
  "recommendation": "BUY/CONSIDER/AVOID",
  "dealScore": 0-100,
  "strengths": ["3-5 specific advantages of this property with details"],
  "risks": ["3-5 specific risks or concerns with details"],
  "cashFlow": {
    "monthly": number (realistic monthly cash flow: rent - all expenses, can be negative),
    "annual": number (monthly * 12)
  },
  "roi": {
    "year1": number (first year return percentage as decimal, e.g., 8.5 for 8.5%),
    "year5": number (projected 5-year cumulative return percentage)
  },
  "location": {
    "neighborhood": "Actual neighborhood name",
    "city": "City name",
    "state": "State abbreviation",
    "marketTrend": "up/down/stable",
    "marketScore": 0-100
  },
  "financials": {
    "estimatedValue": number (use provided or estimate realistic market value),
    "estimatedRent": number (realistic monthly rent for this property type/location),
    "cashFlow": number (monthly cash flow),
    "capRate": number (as decimal, e.g., 5.2 for 5.2%),
    "roi": number (annual ROI as decimal),
    "monthlyMortgage": number (P&I payment assuming 30-year fixed at ~7.5%)
  },
  "investment": {
    "recommendation": "strong_buy/buy/hold/avoid",
    "confidenceScore": 0-100,
    "riskLevel": "low/medium/high",
    "timeHorizon": "short/medium/long"
  },
  "pros": ["3-5 specific advantages"],
  "cons": ["3-5 specific disadvantages"],
  "keyInsights": ["4-6 key insights about this investment opportunity"],
  "nextSteps": ["3-4 specific action items for the investor"]
}

VALIDATION RULES:
- All numeric values must be realistic (no placeholder zeros)
- Cash flow can be negative (be honest if property won't cash flow)
- If data is insufficient, make reasonable assumptions based on the location and note them
- Recommendation must align with the numbers (negative cash flow = hold/avoid)
- Be honest about risks - don't oversell the property
- Deal score should reflect: cash flow (40%), location (30%), ROI (20%), risk (10%)

EXAMPLES:
- "BUY" (80-100): Strong positive cash flow, excellent location, cap rate >6%, low risk
- "CONSIDER" (50-79): Slight positive/break-even cash flow, decent location, cap rate 4-6%
- "AVOID" (0-49): Negative cash flow, declining market, high risk, cap rate <4%

Provide your comprehensive analysis now:`;

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
        max_tokens: 2000,  // Increased from 1000 to support comprehensive analysis
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
        recommendation: "CONSIDER",
        dealScore: 50,
        strengths: ["Property requires manual review"],
        risks: ["AI analysis temporarily unavailable"],
        cashFlow: { monthly: 0, annual: 0 },
        roi: { year1: 0, year5: 0 },
        summary: "Property analysis is temporarily unavailable. Please try again later.",
      },
      recommendation: "CONSIDER",
      dealScore: 50,
      tokensUsed: 0,
    };
  }
}
