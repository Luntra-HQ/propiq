import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import ReactMarkdown from 'react-markdown';
import { SEO } from '../components/SEO';
import { Calendar, Clock, ArrowLeft, Share2, Twitter, Linkedin, Facebook, Link as LinkIcon } from 'lucide-react';

/**
 * Individual Blog Post Page
 * Route: /blog/:slug
 *
 * Features:
 * - Clean reading experience
 * - Auto-generated table of contents
 * - Author byline
 * - Social sharing
 * - Related posts
 * - Email capture CTA
 * - SEO optimized with Article schema
 */

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);

  // Fetch post data
  const post = useQuery(api.blog.getPostBySlug, slug ? { slug } : 'skip');
  const relatedPosts = useQuery(
    api.blog.getRelatedPosts,
    post ? { category: post.category, excludeSlug: post.slug, limit: 3 } : 'skip'
  );

  // Extract headings for table of contents
  const tableOfContents = useMemo(() => {
    if (!post?.content) return [];

    const headings: { id: string; text: string; level: number }[] = [];
    const lines = post.content.split('\n');

    lines.forEach((line, index) => {
      const match = line.match(/^(#{2,3})\s+(.+)$/); // Match ## and ###
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        headings.push({ id, text, level });
      }
    });

    return headings;
  }, [post?.content]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const shareUrl = `https://propiq.luntra.one/blog/${slug}`;
  const shareTitle = post?.title || 'PropIQ Blog';

  const handleShare = (platform: string) => {
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
    }
    if (url) window.open(url, '_blank', 'width=600,height=400');
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!post.isPublished) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Post Not Found</h2>
          <Link to="/blog" className="text-violet-400 hover:text-violet-300">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.excerpt}
        keywords={post.tags.join(', ')}
        canonical={`https://propiq.luntra.one/blog/${post.slug}`}
        ogImage={post.coverImage}
        ogType="article"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt,
          image: post.coverImage,
          datePublished: new Date(post.publishedAt).toISOString(),
          dateModified: new Date(post.updatedAt).toISOString(),
          author: {
            '@type': 'Person',
            name: post.author,
          },
          publisher: {
            '@type': 'Organization',
            name: 'PropIQ',
            logo: {
              '@type': 'ImageObject',
              url: 'https://propiq.luntra.one/logo.png',
            },
          },
        }}
      />

      <div className="min-h-screen bg-slate-900 text-gray-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Back Button */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-violet-600/20 text-violet-300 text-sm font-semibold rounded-full">
                {post.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center gap-6 text-gray-300">
              <div className="flex items-center gap-3">
                <img
                  src={post.authorAvatar}
                  alt={post.author}
                  className="w-10 h-10 rounded-full"
                />
                <span className="font-medium">{post.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.readingTime} min read</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Table of Contents & Share */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Table of Contents */}
                {tableOfContents.length > 0 && (
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">
                      On This Page
                    </h3>
                    <nav className="space-y-2">
                      {tableOfContents.map((heading) => (
                        <a
                          key={heading.id}
                          href={`#${heading.id}`}
                          className={`block text-sm text-gray-400 hover:text-violet-400 transition-colors ${
                            heading.level === 3 ? 'pl-4' : ''
                          }`}
                        >
                          {heading.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Social Share */}
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">
                    Share
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg transition-all"
                    >
                      <Twitter className="h-4 w-4" />
                      <span className="text-sm">Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-blue-700 text-gray-300 hover:text-white rounded-lg transition-all"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span className="text-sm">LinkedIn</span>
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-blue-800 text-gray-300 hover:text-white rounded-lg transition-all"
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="text-sm">Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-violet-600 text-gray-300 hover:text-white rounded-lg transition-all"
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span className="text-sm">{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <article className="prose prose-invert prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-white
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-gray-300 prose-p:leading-relaxed
                prose-a:text-violet-400 prose-a:no-underline hover:prose-a:text-violet-300
                prose-strong:text-white prose-strong:font-semibold
                prose-code:text-violet-300 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700
                prose-ul:text-gray-300 prose-ol:text-gray-300
                prose-li:my-2
                prose-blockquote:border-l-4 prose-blockquote:border-violet-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400
                prose-img:rounded-xl prose-img:shadow-xl
              ">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </article>

              {/* CTA Box */}
              <div className="mt-12 bg-gradient-to-r from-violet-900/40 to-purple-900/40 backdrop-blur-sm border border-violet-500/30 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Ready to analyze a property?
                </h3>
                <p className="text-gray-300 mb-6">
                  Skip the spreadsheet — PropIQ calculates all these metrics instantly with AI-powered insights.
                </p>
                <Link
                  to="/?utm_source=blog&utm_medium=content&utm_campaign={post.slug}"
                  className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-violet-500/50"
                >
                  Try PropIQ Free →
                </Link>
              </div>

              {/* Email Capture */}
              <div className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-2">
                  Get more insights like this
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Join 1,000+ investors receiving weekly real estate tips
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-all">
                    Subscribe
                  </button>
                </div>
              </div>

              {/* Related Posts */}
              {relatedPosts && relatedPosts.length > 0 && (
                <div className="mt-16">
                  <h3 className="text-2xl font-bold text-white mb-6">Related Articles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost._id}
                        to={`/blog/${relatedPost.slug}`}
                        className="group bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-violet-500 transition-all"
                      >
                        <div className="aspect-video bg-slate-700 overflow-hidden">
                          <img
                            src={relatedPost.coverImage}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h4>
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{relatedPost.readingTime} min read</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;
