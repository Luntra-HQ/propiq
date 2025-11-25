/**
 * Convex functions for knowledge base articles
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all published articles
export const getAllArticles = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let articlesQuery = ctx.db
      .query("articles")
      .withIndex("by_published", (q) => q.eq("published", true));

    const articles = await articlesQuery.collect();

    // Filter by category if provided
    if (args.category) {
      return articles.filter(article => article.category === args.category);
    }

    return articles.sort((a, b) => b.viewCount - a.viewCount);
  },
});

// Get a single article by slug
export const getArticleBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return article;
  },
});

// Get featured articles for homepage
export const getFeaturedArticles = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;

    const articles = await ctx.db
      .query("articles")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    return articles
      .filter(article => article.featured)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  },
});

// Get popular articles by view count
export const getPopularArticles = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;

    const articles = await ctx.db
      .query("articles")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    return articles
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  },
});

// Search articles (full-text search)
export const searchArticles = query({
  args: {
    query: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Search by title first
    const titleResults = await ctx.db
      .query("articles")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.query)
      )
      .collect();

    // Search by content
    const contentResults = await ctx.db
      .query("articles")
      .withSearchIndex("search_content", (q) =>
        q.search("content", args.query)
      )
      .collect();

    // Combine and deduplicate
    const allResults = [...titleResults];
    for (const contentResult of contentResults) {
      if (!allResults.find(r => r._id === contentResult._id)) {
        allResults.push(contentResult);
      }
    }

    // Filter by category if provided
    let filtered = allResults.filter(article => article.published);
    if (args.category) {
      filtered = filtered.filter(article => article.category === args.category);
    }

    return filtered;
  },
});

// Increment article view count
export const incrementViewCount = mutation({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new Error("Article not found");
    }

    await ctx.db.patch(args.articleId, {
      viewCount: article.viewCount + 1,
    });

    return { success: true };
  },
});

// Submit article feedback
export const submitArticleFeedback = mutation({
  args: {
    articleId: v.id("articles"),
    userId: v.id("users"),
    vote: v.number(), // 1 or -1
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already voted on this article
    const existingFeedback = await ctx.db
      .query("articleFeedback")
      .withIndex("by_article_and_user", (q) =>
        q.eq("articleId", args.articleId).eq("userId", args.userId)
      )
      .first();

    // If exists, update the vote
    if (existingFeedback) {
      await ctx.db.patch(existingFeedback._id, {
        vote: args.vote,
        comment: args.comment,
      });
    } else {
      // Create new feedback
      await ctx.db.insert("articleFeedback", {
        articleId: args.articleId,
        userId: args.userId,
        vote: args.vote,
        comment: args.comment,
        createdAt: Date.now(),
      });
    }

    // Update article's helpful/unhelpful counts
    const article = await ctx.db.get(args.articleId);
    if (article) {
      // Recalculate counts from all feedback
      const allFeedback = await ctx.db
        .query("articleFeedback")
        .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
        .collect();

      const helpfulVotes = allFeedback.filter(f => f.vote === 1).length;
      const unhelpfulVotes = allFeedback.filter(f => f.vote === -1).length;

      await ctx.db.patch(args.articleId, {
        helpfulVotes,
        unhelpfulVotes,
      });
    }

    return { success: true };
  },
});

// Log failed search
export const logFailedSearch = mutation({
  args: {
    query: v.string(),
    userId: v.optional(v.id("users")),
    page: v.optional(v.string()),
    resultsCount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("failedSearches", {
      query: args.query,
      userId: args.userId,
      page: args.page,
      resultsCount: args.resultsCount,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Get article categories with counts
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    const categoryCounts: Record<string, number> = {};

    for (const article of articles) {
      categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
    }

    return Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));
  },
});

// Admin: Create article
export const createArticle = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    published: v.boolean(),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    const articleId = await ctx.db.insert("articles", {
      title: args.title,
      slug: args.slug,
      content: args.content,
      excerpt: args.excerpt,
      category: args.category,
      tags: args.tags,
      published: args.published,
      featured: args.featured,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { articleId };
  },
});
