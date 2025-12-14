import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Search, BookOpen, X, ThumbsUp, ThumbsDown, ArrowLeft, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import './HelpCenter.css';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
  userId: Id<"users"> | null;
  initialArticleSlug?: string;
}

// Constants for input validation
const MAX_SEARCH_LENGTH = 200;

export const HelpCenter = ({ isOpen, onClose, userId, initialArticleSlug }: HelpCenterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [votedArticles, setVotedArticles] = useState<Set<string>>(new Set());

  // Queries
  const allArticles = useQuery(api.articles.getAllArticles, {
    category: selectedCategory || undefined,
  });
  const popularArticles = useQuery(api.articles.getPopularArticles, { limit: 5 });
  const categories = useQuery(api.articles.getCategories, {});
  const searchArticles = useQuery(api.articles.searchArticles, {
    query: searchQuery,
    category: selectedCategory || undefined,
  });

  // Mutations
  const incrementViewCount = useMutation(api.articles.incrementViewCount);
  const submitFeedback = useMutation(api.articles.submitArticleFeedback);
  const logFailedSearch = useMutation(api.articles.logFailedSearch);

  // Load initial article if provided
  useEffect(() => {
    if (initialArticleSlug && allArticles) {
      const article = allArticles.find((a: any) => a.slug === initialArticleSlug);
      if (article) {
        handleArticleClick(article);
      }
    }
  }, [initialArticleSlug, allArticles]);

  // Sanitize and validate search input
  const sanitizeSearchQuery = (input: string): string => {
    // Trim whitespace
    let cleaned = input.trim();

    // Limit length
    if (cleaned.length > MAX_SEARCH_LENGTH) {
      cleaned = cleaned.substring(0, MAX_SEARCH_LENGTH);
    }

    // Sanitize with DOMPurify (remove any HTML/script tags)
    cleaned = DOMPurify.sanitize(cleaned, { ALLOWED_TAGS: [] });

    return cleaned;
  };

  // Handle search
  useEffect(() => {
    const sanitizedQuery = sanitizeSearchQuery(searchQuery);

    if (sanitizedQuery.length > 2) {
      setIsSearching(true);
      // Search results come from the query
      if (searchArticles) {
        setSearchResults(searchArticles);
        setIsSearching(false);

        // Log if no results
        if (searchArticles.length === 0) {
          logFailedSearch({
            query: sanitizedQuery,
            userId: userId || undefined,
            page: "help-center",
            resultsCount: 0,
          });
        }
      }
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, searchArticles, userId]);

  const handleArticleClick = async (article: any) => {
    setSelectedArticle(article);
    setSearchQuery('');
    setSearchResults([]);

    // Increment view count
    if (article._id) {
      await incrementViewCount({ articleId: article._id });
    }
  };

  const handleFeedback = async (articleId: Id<"articles">, vote: number) => {
    if (!userId) return;

    // Prevent duplicate votes
    const articleIdString = articleId.toString();
    if (votedArticles.has(articleIdString)) {
      return; // Already voted on this article
    }

    await submitFeedback({
      articleId,
      userId,
      vote,
    });

    // Mark as voted
    setVotedArticles(prev => new Set(prev).add(articleIdString));
  };

  const handleBack = () => {
    setSelectedArticle(null);
  };

  // Keyboard navigation (Escape key to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const categoryLabels: Record<string, string> = {
    "getting-started": "Getting Started",
    "property-analysis": "Property Analysis",
    "calculator": "Deal Calculator",
    "troubleshooting": "Troubleshooting",
    "billing": "Billing & Plans",
    "advanced": "Advanced Features",
    "education": "Real Estate Education",
  };

  if (!isOpen) return null;

  return (
    <div className="help-center-overlay" onClick={onClose}>
      <div
        className="help-center-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-center-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="help-center-header">
          <div className="header-left">
            {selectedArticle && (
              <button onClick={handleBack} className="back-button" aria-label="Go back to articles list">
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <BookOpen className="h-6 w-6 text-violet-400" />
            <h2 id="help-center-title">PropIQ Help Center</h2>
          </div>
          <button onClick={onClose} className="close-button" aria-label="Close Help Center">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="help-center-content">
          {selectedArticle ? (
            // Article View
            <div className="article-view">
              <div className="article-header">
                <span className="article-category">
                  {categoryLabels[selectedArticle.category] || selectedArticle.category}
                </span>
                <h1>{selectedArticle.title}</h1>
              </div>

              <div className="article-body">
                <ReactMarkdown
                  skipHtml={true}
                  disallowedElements={['script', 'iframe', 'object', 'embed', 'style']}
                  unwrapDisallowed={true}
                >
                  {selectedArticle.content}
                </ReactMarkdown>
              </div>

              {/* Article Feedback */}
              <div className="article-feedback">
                <p className="feedback-question">Was this article helpful?</p>
                <div className="feedback-buttons">
                  <button
                    onClick={() => handleFeedback(selectedArticle._id, 1)}
                    className="feedback-button helpful"
                    disabled={!userId || votedArticles.has(selectedArticle._id.toString())}
                    aria-label="Mark article as helpful"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Yes ({selectedArticle.helpfulVotes || 0})
                  </button>
                  <button
                    onClick={() => handleFeedback(selectedArticle._id, -1)}
                    className="feedback-button unhelpful"
                    disabled={!userId || votedArticles.has(selectedArticle._id.toString())}
                    aria-label="Mark article as unhelpful"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    No ({selectedArticle.unhelpfulVotes || 0})
                  </button>
                </div>
                {!userId && (
                  <p className="feedback-hint">Log in to provide feedback</p>
                )}
                {votedArticles.has(selectedArticle._id.toString()) && (
                  <p className="feedback-hint">Thank you for your feedback!</p>
                )}
              </div>
            </div>
          ) : (
            // Search & Browse View
            <>
              {/* Search Bar */}
              <div className="search-section">
                <div className="search-bar">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    aria-label="Search help articles"
                    maxLength={MAX_SEARCH_LENGTH}
                    autoFocus
                  />
                </div>

                {/* Search Results */}
                {searchQuery.length > 2 && (
                  <div className="search-results">
                    {isSearching ? (
                      <p className="search-status">Searching...</p>
                    ) : searchResults.length > 0 ? (
                      <>
                        <p className="search-status">
                          Found {searchResults.length} article{searchResults.length !== 1 ? 's' : ''}
                        </p>
                        <div className="articles-list">
                          {searchResults.map((article: any) => (
                            <div
                              key={article._id}
                              className="article-card"
                              onClick={() => handleArticleClick(article)}
                            >
                              <h3>{article.title}</h3>
                              <p className="article-excerpt">{article.excerpt}</p>
                              <span className="article-meta">
                                {categoryLabels[article.category]} · {article.viewCount} views
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="no-results">
                        <p>No articles found for "{searchQuery}"</p>
                        <p className="no-results-hint">Try these suggestions:</p>
                        <ul className="no-results-suggestions">
                          <li>Use different or more general keywords</li>
                          <li>Check for typos in your search</li>
                          <li>Browse categories below for related topics</li>
                          <li>Contact support at <a href="mailto:support@luntra.one">support@luntra.one</a></li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Categories */}
              {!searchQuery && (
                <>
                  {/* Popular Articles */}
                  <div className="section">
                    <h3 className="section-title">Popular Articles</h3>
                    <div className="articles-list">
                      {popularArticles?.map((article: any) => (
                        <div
                          key={article._id}
                          className="article-card"
                          onClick={() => handleArticleClick(article)}
                        >
                          <h4>{article.title}</h4>
                          <p className="article-excerpt">{article.excerpt}</p>
                          <span className="article-meta">
                            {categoryLabels[article.category]} · {article.viewCount} views
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Browse by Category */}
                  <div className="section">
                    <h3 className="section-title">Browse by Category</h3>
                    <div className="categories-grid">
                      {categories?.map((cat: any) => (
                        <button
                          key={cat.category}
                          className="category-card"
                          onClick={() => setSelectedCategory(cat.category)}
                        >
                          <span className="category-name">
                            {categoryLabels[cat.category] || cat.category}
                          </span>
                          <span className="category-count">{cat.count} articles</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Category Articles */}
                  {selectedCategory && (
                    <div className="section">
                      <div className="section-header">
                        <h3 className="section-title">
                          {categoryLabels[selectedCategory]} Articles
                        </h3>
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className="clear-filter"
                        >
                          Clear filter
                        </button>
                      </div>
                      <div className="articles-list">
                        {allArticles?.map((article: any) => (
                          <div
                            key={article._id}
                            className="article-card"
                            onClick={() => handleArticleClick(article)}
                          >
                            <h4>{article.title}</h4>
                            <p className="article-excerpt">{article.excerpt}</p>
                            <span className="article-meta">{article.viewCount} views</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Support */}
                  <div className="contact-support">
                    <p className="contact-text">
                      Can't find what you're looking for?
                    </p>
                    <div className="contact-buttons">
                      <button className="contact-button primary">
                        Chat with AI Assistant
                      </button>
                      <a
                        href="mailto:support@luntra.one"
                        className="contact-button secondary"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Email Support
                      </a>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
