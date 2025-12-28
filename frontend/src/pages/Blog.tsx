import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { SEO } from '../components/SEO';
import { Search, Calendar, Clock, ArrowRight, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Blog Index Page
 * Route: /blog
 *
 * Features:
 * - Grid layout of blog post cards
 * - Category filtering
 * - Client-side search
 * - Pagination
 * - Email capture sidebar
 * - SEO optimized
 */

interface BlogPostCard {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  authorAvatar: string;
  publishedAt: number;
  readingTime: number;
}

const POSTS_PER_PAGE = 12;

const CATEGORIES = [
  { id: 'all', label: 'All Posts', color: 'violet' },
  { id: 'analysis-tips', label: 'Analysis Tips', color: 'emerald' },
  { id: 'market-insights', label: 'Market Insights', color: 'blue' },
  { id: 'calculator-guides', label: 'Calculator Guides', color: 'amber' },
  { id: 'case-studies', label: 'Case Studies', color: 'rose' },
];

export const Blog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [email, setEmail] = useState('');

  // Fetch all published posts
  const posts = useQuery(api.blog.getPublishedPosts) ?? [];

  // Filter and search posts
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    // Search by title, excerpt, or tags
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.excerpt.toLowerCase().includes(searchLower) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [posts, selectedCategory, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with lead capture
    console.log('Email submitted:', email);
    alert('Thanks! You\'ll receive weekly insights in your inbox.');
    setEmail('');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <SEO
        title="PropIQ Insights - Real Estate Investment Blog"
        description="Data-driven analysis and strategies for smarter property investing. Learn about cap rates, cash flow analysis, market trends, and more."
        keywords="real estate investing, property analysis, cap rate, cash flow, rental property, real estate tips"
        canonical="https://propiq.luntra.one/blog"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'PropIQ Insights',
          description: 'Real estate investment analysis tips and strategies',
          url: 'https://propiq.luntra.one/blog',
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
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              PropIQ Insights
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl">
              Data-driven analysis and strategies for smarter property investing
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search and Filters */}
              <div className="mb-8 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setCurrentPage(1); // Reset to first page on filter
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedCategory === category.id
                          ? `bg-${category.color}-600 text-white shadow-lg`
                          : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-6 text-sm text-gray-400">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
                {searchTerm && ` matching "${searchTerm}"`}
              </div>

              {/* Blog Post Grid */}
              {paginatedPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {paginatedPosts.map((post) => (
                    <Link
                      key={post._id}
                      to={`/blog/${post.slug}`}
                      className="group bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-violet-500 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/20"
                    >
                      {/* Cover Image */}
                      <div className="aspect-video bg-slate-700 overflow-hidden">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Category Badge */}
                        <div className="mb-3">
                          <span className="inline-block px-3 py-1 bg-violet-600/20 text-violet-300 text-xs font-semibold rounded-full">
                            {CATEGORIES.find((c) => c.id === post.category)?.label || post.category}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-violet-400 transition-colors line-clamp-2">
                          {post.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p>

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(post.publishedAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{post.readingTime} min read</span>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-xl text-gray-400">No articles found</p>
                  <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* Email Capture */}
                <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 backdrop-blur-sm border border-violet-500/30 rounded-xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-3">
                    Weekly Insights
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Get our latest real estate investment tips and market analysis delivered to your inbox every week.
                  </p>
                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <input
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-violet-500/50"
                    >
                      Subscribe
                    </button>
                  </form>
                  <p className="text-xs text-gray-400 mt-3">
                    No spam. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
