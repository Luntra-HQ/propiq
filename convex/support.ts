/**
 * Support chat functions for PropIQ
 * AI-powered customer support
 */

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Send support chat message
export const sendMessage = action({
  args: {
    userId: v.id("users"),
    conversationId: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate conversation ID if not provided
    const conversationId =
      args.conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Get conversation history
    const conversation = await ctx.runQuery(api.support.getConversation, {
      conversationId,
    });

    // Build message history for AI
    const messages = conversation?.messages || [];
    messages.push({
      role: "user",
      content: args.message,
      timestamp: Date.now(),
    });

    // Get AI response
    const aiResponse = await generateSupportResponse(messages);

    // Add AI response to messages
    messages.push({
      role: "assistant",
      content: aiResponse,
      timestamp: Date.now(),
    });

    // Save or update conversation
    if (conversation) {
      await ctx.runMutation(api.support.updateConversation, {
        conversationId,
        messages,
      });
    } else {
      await ctx.runMutation(api.support.createConversation, {
        userId: args.userId,
        conversationId,
        messages,
      });
    }

    return {
      success: true,
      conversationId,
      response: aiResponse,
      timestamp: Date.now(),
    };
  },
});

// Create new conversation
export const createConversation = mutation({
  args: {
    userId: v.id("users"),
    conversationId: v.string(),
    messages: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
        timestamp: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const chatId = await ctx.db.insert("supportChats", {
      userId: args.userId,
      conversationId: args.conversationId,
      messages: args.messages,
      status: "open",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return chatId;
  },
});

// Update existing conversation
export const updateConversation = mutation({
  args: {
    conversationId: v.string(),
    messages: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
        timestamp: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("supportChats")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .first();

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    await ctx.db.patch(conversation._id, {
      messages: args.messages,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get conversation by ID
export const getConversation = query({
  args: { conversationId: v.string() },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("supportChats")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .first();

    return conversation;
  },
});

// Get user's conversations
export const getUserConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("supportChats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return conversations.map((conv) => ({
      ...conv,
      chatId: conv._id.toString(),
      lastMessage: conv.messages[conv.messages.length - 1],
    }));
  },
});

// AI Support Response Generator
async function generateSupportResponse(
  messages: Array<{ role: string; content: string; timestamp: number }>
): Promise<string> {
  // Get Azure OpenAI credentials from environment
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureKey = process.env.AZURE_OPENAI_KEY;
  const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview";
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";

  if (!azureEndpoint || !azureKey) {
    return "I'm sorry, but the support chat is temporarily unavailable. Please email support@luntra.one for assistance.";
  }

  const systemPrompt = `You are a helpful customer support assistant for PropIQ, an AI-powered real estate investment analysis platform.

PropIQ Features:
- AI property analysis for real estate investments
- Deal calculator with 3 tabs (Basic, Advanced, Scenarios)
- Subscription tiers: Free (3 analyses), Starter ($29/mo, 20 analyses), Pro ($79/mo, 100 analyses), Elite ($199/mo, unlimited)
- Property analysis includes deal scores, cash flow projections, ROI estimates

Your role:
- Help users understand how to use PropIQ
- Answer questions about features and pricing
- Provide guidance on real estate investment analysis
- Be friendly, professional, and concise
- If you don't know something, direct users to support@luntra.one

Keep responses under 150 words.`;

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
            content: systemPrompt,
          },
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Support chat AI error:", error);
    return "I apologize, but I'm having trouble connecting right now. Please email support@luntra.one and we'll help you as soon as possible.";
  }
}
