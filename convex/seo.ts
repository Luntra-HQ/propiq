/**
 * SEO Functions
 * Dynamic sitemap generation including blog posts
 */

import { query } from "./_generated/server";

/**
 * Generate dynamic sitemap XML
 * Includes static pages + all published blog posts
 */
export const generateSitemap = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_is_published", (q) => q.eq("isPublished", true))
      .collect();

    const currentDate = new Date().toISOString().split('T')[0];

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily', lastmod: currentDate },
      { url: '/pricing', priority: '0.8', changefreq: 'weekly', lastmod: currentDate },
      { url: '/faq', priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
      { url: '/blog', priority: '0.9', changefreq: 'daily', lastmod: currentDate },
      { url: '/free/due-diligence-checklist', priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
    ];

    // Dynamic blog post pages
    const blogPages = posts.map((post) => ({
      url: `/blog/${post.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: new Date(post.updatedAt).toISOString().split('T')[0],
    }));

    const allPages = [...staticPages, ...blogPages];

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>https://propiq.luntra.one${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return xml;
  },
});

/**
 * Generate RSS feed for blog
 */
export const generateRSS = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_is_published", (q) => q.eq("isPublished", true))
      .order("desc")
      .take(20); // Last 20 posts

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PropIQ Insights</title>
    <link>https://propiq.luntra.one/blog</link>
    <description>Data-driven analysis and strategies for smarter property investing</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://propiq.luntra.one/rss.xml" rel="self" type="application/rss+xml" />
${posts
  .map(
    (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>https://propiq.luntra.one/blog/${post.slug}</link>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <guid isPermaLink="true">https://propiq.luntra.one/blog/${post.slug}</guid>
      <category>${post.category}</category>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>`;

    return xml;
  },
});
