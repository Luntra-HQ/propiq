import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Search, BookOpen, X, ThumbsUp, ThumbsDown, ArrowLeft, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './HelpCenter.css';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
  userId: Id<"users"> | null;
  initialArticleSlug?: string;
}

export const HelpCenter = ({ isOpen, onClose, userId, initialArticleSlug }: HelpCenterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  // Handle search
  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
      // Search results come from the query
      if (searchArticles) {
        setSearchResults(searchArticles);
        setIsSearching(false);

        // Log if no results
        if (searchArticles.length === 0) {
          logFailedSearch({
            query: searchQuery,
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

    await submitFeedback({
      articleId,
      userId,
      vote,
    });
  };

  const handleBack = () => {
    setSelectedArticle(null);
  };

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
    <div className="help-center-overlay">
      <div className="help-center-modal">
        {/* Header */}
        <div className="help-center-header">
          <div className="header-left">
            {selectedArticle && (
              <button onClick={handleBack} className="back-button">
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <BookOpen className="h-6 w-6 text-violet-400" />
            <h2>PropIQ Help Center</h2>
          </div>
          <button onClick={onClose} className="close-button">
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
                <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
              </div>

              {/* Article Feedback */}
              <div className="article-feedback">
                <p className="feedback-question">Was this article helpful?</p>
                <div className="feedback-buttons">
                  <button
                    onClick={() => handleFeedback(selectedArticle._id, 1)}
                    className="feedback-button helpful"
                    disabled={!userId}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Yes ({selectedArticle.helpfulVotes || 0})
                  </button>
                  <button
                    onClick={() => handleFeedback(selectedArticle._id, -1)}
                    className="feedback-button unhelpful"
                    disabled={!userId}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    No ({selectedArticle.unhelpfulVotes || 0})
                  </button>
                </div>
                {!userId && (
                  <p className="feedback-hint">Log in to provide feedback</p>
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
                        <p className="no-results-hint">
                          Try different keywords or{' '}
                          <button className="inline-link">ask our AI assistant</button>
                        </p>
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
