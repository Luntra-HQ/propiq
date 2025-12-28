/**
 * Dynamic Sitemap Generator for PropIQ Blog Posts
 *
 * This script fetches published blog posts from Convex and generates
 * an XML sitemap at /public/sitemap-dynamic.xml
 *
 * Run: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

// Import Convex client
const { ConvexHttpClient } = require('convex/browser');

// Convex deployment URL
const CONVEX_URL = process.env.VITE_CONVEX_URL || 'https://mild-tern-361.convex.cloud';
const client = new ConvexHttpClient(CONVEX_URL);

async function generateDynamicSitemap() {
  console.log('🔍 Fetching blog posts from Convex...');

  try {
    // Fetch all published blog posts
    const posts = await client.query('blog:getPublishedPosts', {});

    if (!posts || posts.length === 0) {
      console.warn('⚠️  No published blog posts found');
      return;
    }

    console.log(`✅ Found ${posts.length} published posts`);

    // Generate XML sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!--
    PropIQ Blog - Dynamic Sitemap
    Generated: ${new Date().toISOString()}
    Posts: ${posts.length}

    This sitemap is automatically generated from Convex database.
    Run: npm run generate-sitemap to regenerate.
  -->

${posts.map(post => {
  const lastmod = new Date(post.updatedAt || post.publishedAt).toISOString().split('T')[0];
  const priority = getPriority(post);

  return `  <!-- ${post.title} -->
  <url>
    <loc>https://propiq.luntra.one/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${post.coverImage}</image:loc>
      <image:title>${escapeXml(post.title)}</image:title>
    </image:image>
  </url>
`;
}).join('\n')}
</urlset>
`;

    // Write to public folder
    const outputPath = path.join(__dirname, '../public/sitemap-dynamic.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');

    console.log(`✅ Dynamic sitemap generated: ${outputPath}`);
    console.log(`📊 Total URLs: ${posts.length}`);
    console.log('\n📝 Blog posts included:');
    posts.forEach(post => {
      console.log(`   • ${post.slug} (${new Date(post.publishedAt).toLocaleDateString()})`);
    });

  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

/**
 * Determine priority based on post category and recency
 */
function getPriority(post) {
  const daysSincePublished = (Date.now() - post.publishedAt) / (1000 * 60 * 60 * 24);

  // High-value categories
  const highValueCategories = ['calculator-guides', 'case-studies'];

  if (highValueCategories.includes(post.category)) {
    return '0.9'; // High priority for calculator guides
  } else if (daysSincePublished < 30) {
    return '0.8'; // Recent posts get higher priority
  } else {
    return '0.7'; // Standard priority for older posts
  }
}

/**
 * Escape special XML characters
 */
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Run the generator
generateDynamicSitemap()
  .then(() => {
    console.log('\n✅ Sitemap generation complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Deploy the updated sitemap to production');
    console.log('   2. Submit sitemap-dynamic.xml to Google Search Console');
    console.log('   3. Submit sitemap-dynamic.xml to Bing Webmaster Tools');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
