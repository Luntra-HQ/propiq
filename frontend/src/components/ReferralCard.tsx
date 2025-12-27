import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Copy, Check, Share2, Users, Award } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';

interface ReferralCardProps {
  userId: Id<"users">;
}

export const ReferralCard: React.FC<ReferralCardProps> = ({ userId }) => {
  const [copied, setCopied] = useState(false);
  const getOrCreateReferralCode = useMutation(api.referrals.getOrCreateReferralCode);
  const referralStats = useQuery(api.referrals.getReferralStats, { userId });
  const [referralData, setReferralData] = useState<{ code: string; url: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferralCode = async () => {
      try {
        const result = await getOrCreateReferralCode({ userId });
        setReferralData(result);
      } catch (error) {
        console.error('Failed to get referral code:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralCode();
  }, [userId]);

  const handleCopy = () => {
    if (referralData) {
      navigator.clipboard.writeText(referralData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform: 'twitter' | 'linkedin') => {
    if (!referralData) return;

    const text = `I've been using PropIQ to analyze real estate deals. Get 3 free analyses: ${referralData.url}`;

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralData.url)}`,
    };

    window.open(urls[platform], '_blank', 'width=550,height=420');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl shadow-sm border border-violet-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Refer & Earn</h3>
          <p className="text-sm text-gray-600">Get 1 month free for every friend who upgrades</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <label className="block text-xs font-medium text-gray-500 mb-2">Your Referral Link</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={referralData?.url || ''}
            readOnly
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 min-w-[100px] justify-center"
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <div className="text-2xl font-bold text-violet-600">{referralStats?.total || 0}</div>
          <div className="text-xs text-gray-600 mt-1">Invited</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{referralStats?.converted || 0}</div>
          <div className="text-xs text-gray-600 mt-1">Converted</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <div className="text-2xl font-bold text-amber-600">{referralStats?.rewarded || 0}</div>
          <div className="text-xs text-gray-600 mt-1">Months Earned</div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleShare('twitter')}
          className="flex-1 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-all border border-gray-300 flex items-center justify-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Twitter
        </button>
        <button
          onClick={() => handleShare('linkedin')}
          className="flex-1 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-all border border-gray-300 flex items-center justify-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          LinkedIn
        </button>
      </div>

      {/* Reward Info */}
      {(referralStats?.converted || 0) > 0 && (
        <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-3 flex items-start gap-2">
          <Award className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">
              You've earned {referralStats?.rewarded || 0} free {(referralStats?.rewarded || 0) === 1 ? 'month' : 'months'}!
            </p>
            <p className="text-xs text-green-700 mt-1">
              Your rewards are automatically applied to your next billing cycle.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralCard;
