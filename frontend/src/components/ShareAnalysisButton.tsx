import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, X, Lock, Unlock, ExternalLink } from 'lucide-react';
import { useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

interface ShareAnalysisButtonProps {
  analysisId: Id<"propertyAnalyses">;
  userId: Id<"users">;
  isPublic?: boolean;
}

export const ShareAnalysisButton: React.FC<ShareAnalysisButtonProps> = ({
  analysisId,
  userId,
  isPublic = false
}) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isShared, setIsShared] = useState(isPublic);

  const generateShareLink = useAction(api.sharing.generateShareLink);
  const togglePublicSharing = useMutation(api.sharing.togglePublicSharing);
  const revokeShareLink = useMutation(api.sharing.revokeShareLink);

  useEffect(() => {
    setIsShared(isPublic);
  }, [isPublic]);

  const handleOpenModal = async () => {
    setShowModal(true);
    setLoading(true);

    try {
      const result = await generateShareLink({ analysisId, userId });
      if (result.success && result.url) {
        setShareUrl(result.url);
        setIsShared(true);
      }
    } catch (error) {
      console.error('Failed to generate share link:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    if (!shareUrl) return;

    const text = `Check out my PropIQ property analysis:`;

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    window.open(urls[platform], '_blank', 'width=550,height=420');
  };

  const handleTogglePublic = async () => {
    try {
      await togglePublicSharing({ analysisId, userId });
      setIsShared(!isShared);
    } catch (error) {
      console.error('Failed to toggle sharing:', error);
    }
  };

  const handleStopSharing = async () => {
    try {
      await revokeShareLink({ analysisId, userId });
      setIsShared(false);
      setShareUrl(null);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to stop sharing:', error);
    }
  };

  return (
    <>
      {/* Share Button */}
      <button
        onClick={handleOpenModal}
        className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-violet-500/30"
        title="Share this analysis"
      >
        <Share2 className="h-4 w-4" />
        <span className="text-sm">Share Analysis</span>
        {isShared && (
          <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
            Shared
          </span>
        )}
      </button>

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl border border-violet-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Share2 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Share Analysis</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500 mb-4"></div>
                  <p className="text-gray-300">Generating share link...</p>
                </div>
              ) : (
                <>
                  {/* Shareable Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Shareable Link
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={shareUrl || ''}
                        readOnly
                        className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm font-mono text-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <button
                        onClick={handleCopy}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-all flex items-center gap-2 min-w-[100px] justify-center shadow-lg shadow-violet-500/30"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Privacy Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
                    <div className="flex items-center gap-3">
                      {isShared ? (
                        <Unlock className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <Lock className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-200">
                          {isShared ? 'Anyone with link can view' : 'Link is private'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {isShared ? 'This analysis is publicly accessible' : 'Only you can view this analysis'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleTogglePublic}
                      className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                        isShared
                          ? 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                          : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                      }`}
                    >
                      {isShared ? 'Public' : 'Private'}
                    </button>
                  </div>

                  {/* Social Share Buttons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Share on Social Media
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleShare('twitter')}
                        className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-gray-200 font-medium rounded-lg transition-all border border-slate-600 hover:border-violet-500/50 flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Twitter
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-gray-200 font-medium rounded-lg transition-all border border-slate-600 hover:border-violet-500/50 flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        LinkedIn
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-gray-200 font-medium rounded-lg transition-all border border-slate-600 hover:border-violet-500/50 flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Facebook
                      </button>
                    </div>
                  </div>

                  {/* Stop Sharing Button */}
                  {isShared && (
                    <div className="pt-4 border-t border-slate-700">
                      <button
                        onClick={handleStopSharing}
                        className="w-full px-4 py-2 bg-red-900/30 hover:bg-red-800/40 text-red-300 font-medium rounded-lg transition-all border border-red-700/50"
                      >
                        Stop Sharing & Revoke Link
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareAnalysisButton;
