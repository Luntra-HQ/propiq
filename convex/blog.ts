/**
 * Blog Content Management Functions
 * CRUD operations for blog posts
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query: Get all published posts sorted by date
export const getPublishedPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_is_published", (q) => q.eq("isPublished", true))
      .order("desc")
      .collect();

    return posts;
  },
});

// Query: Get single post by slug
export const getPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    // Increment view count
    if (post && post.isPublished) {
      await ctx.db.patch(post._id, {
        viewCount: (post.viewCount || 0) + 1,
      });
    }

    return post;
  },
});

// Query: Get posts by category
export const getPostsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_category", (q) => q.eq("category", category))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .order("desc")
      .collect();

    return posts;
  },
});

// Query: Get related posts (same category, excluding current)
export const getRelatedPosts = query({
  args: {
    category: v.string(),
    excludeSlug: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, excludeSlug, limit = 3 }) => {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_category", (q) => q.eq("category", category))
      .filter((q) =>
        q.and(
          q.eq(q.field("isPublished"), true),
          q.neq(q.field("slug"), excludeSlug)
        )
      )
      .order("desc")
      .take(limit);

    return posts;
  },
});

// Query: Search posts (simple text search on title and excerpt)
export const searchPosts = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    const allPosts = await ctx.db
      .query("blogPosts")
      .withIndex("by_is_published", (q) => q.eq("isPublished", true))
      .collect();

    // Simple client-side filtering for now
    const searchLower = searchTerm.toLowerCase();
    return allPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  },
});

// Mutation: Create new post (admin only)
export const createPost = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    content: v.string(),
    coverImage: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    author: v.string(),
    authorAvatar: v.string(),
    readingTime: v.number(),
    isPublished: v.optional(v.boolean()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const postId = await ctx.db.insert("blogPosts", {
      slug: args.slug,
      title: args.title,
      excerpt: args.excerpt,
      content: args.content,
      coverImage: args.coverImage,
      category: args.category,
      tags: args.tags,
      author: args.author,
      authorAvatar: args.authorAvatar,
      readingTime: args.readingTime,
      publishedAt: now,
      updatedAt: now,
      isPublished: args.isPublished ?? false,
      seoTitle: args.seoTitle,
      seoDescription: args.seoDescription,
      viewCount: 0,
    });

    return postId;
  },
});

// Mutation: Update existing post
export const updatePost = mutation({
  args: {
    postId: v.id("blogPosts"),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    author: v.optional(v.string()),
    authorAvatar: v.optional(v.string()),
    readingTime: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
  },
  handler: async (ctx, { postId, ...updates }) => {
    await ctx.db.patch(postId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Mutation: Publish post
export const publishPost = mutation({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, { postId }) => {
    await ctx.db.patch(postId, {
      isPublished: true,
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Query: Get all posts (admin - includes unpublished)
export const getAllPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("blogPosts").order("desc").collect();
    return posts;
  },
});
