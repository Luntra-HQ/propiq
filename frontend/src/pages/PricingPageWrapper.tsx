/**
 * Standalone Pricing Page Wrapper
 * Provides Stripe checkout + auth gating for /pricing route.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAction } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { useAuth } from '../hooks/useAuth';
import PricingPage from '../components/PricingPage';

const PricingPageWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  const [currentTier, setCurrentTier] = useState<string>('free');
  const [userId, setUserId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');

  // Use string reference instead of api.payments.createCheckoutSession
  // This bypasses anyApi proxy issues in production builds
  const createCheckout = useAction("payments:createCheckoutSession" as any);

  // Check for promo code in URL (e.g., /pricing?promo=PRODUCTHUNT)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlPromo = urlParams.get('promo');
    if (urlPromo) {
      setPromoCode(urlPromo.toUpperCase());
      console.log(`[PRICING] Promo code detected from URL: ${urlPromo}`);
    }
  }, []);

  // Sync user data
  useEffect(() => {
    if (!isLoading && user) {
      setUserId(user._id);
      setCurrentTier(user.subscriptionTier || 'free');
    }
  }, [user, isLoading]);

  const handleSelectTier = useCallback(async (tierId: string) => {
    console.log(`[PRICING] Upgrading to tier: ${tierId}`);

    try {
      console.log('[PRICING] Creating Stripe checkout session...');

      const checkoutParams: any = {
        tier: tierId,
        successUrl: `${window.location.origin}/welcome?payment=success`,
        cancelUrl: `${window.location.origin}/pricing`,
      };

      // Add userId if logged in (for existing users upgrading)
      if (userId) {
        checkoutParams.userId = userId as Id<'users'>;
        checkoutParams.successUrl = `${window.location.origin}/app?upgrade=success`;
      }

      // Add promo code if present
      if (promoCode) {
        checkoutParams.promotionCode = promoCode;
        console.log(`[PRICING] Applying promo code: ${promoCode}`);
      }

      console.log('[PRICING] Calling createCheckout with params:', checkoutParams);
      const result = await createCheckout(checkoutParams);
      console.log('[PRICING] Received result:', result);

      if (result?.success && result.url) {
        console.log('[PRICING] Redirecting to Stripe checkout:', result.sessionId);
        window.location.href = result.url;
      } else {
        console.error('[PRICING] Invalid result from createCheckout:', result);
        throw new Error('Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('[PRICING] Stripe checkout error:', error);
      alert(`Checkout Error: ${error?.message || 'Unable to start checkout. Please try again.'}`);
    }
  }, [user, userId, createCheckout, navigate]);

  // Auto-trigger checkout if user just logged in with a selected tier
  // BUT ONLY if they're upgrading FROM an existing free account
  // NOT if they just created a new account (we want them to use free trial first)
  useEffect(() => {
    if (!isLoading && user && userId) {
      const selectedTier = sessionStorage.getItem('selectedTier');
      const checkoutIntent = sessionStorage.getItem('checkoutIntent');
      const justSignedUp = sessionStorage.getItem('justSignedUp'); // Check if user just signed up

      // Don't auto-trigger checkout for brand new users
      if (selectedTier && checkoutIntent && !justSignedUp) {
        console.log(`[PRICING] Auto-triggering checkout for tier: ${selectedTier}`);
        sessionStorage.removeItem('selectedTier');
        sessionStorage.removeItem('checkoutIntent');
        setTimeout(() => {
          console.log(`[PRICING] Executing auto-checkout for: ${selectedTier}`);
          handleSelectTier(selectedTier);
        }, 500);
      } else if (justSignedUp) {
        // New user - clear checkout intent and redirect to app to use free trial
        console.log('[PRICING] New user detected - clearing checkout intent, redirecting to app');
        sessionStorage.removeItem('selectedTier');
        sessionStorage.removeItem('checkoutIntent');
        sessionStorage.removeItem('justSignedUp');
        navigate('/app');
      }
    }
  }, [user, userId, isLoading, handleSelectTier, navigate]);

  const handleClose = () => {
    if (user) navigate('/app');
    else navigate('/');
  };

  return (
    <PricingPage
      currentTier={currentTier}
      onSelectTier={handleSelectTier}
      onClose={handleClose}
      promoCode={promoCode}
      onPromoCodeChange={setPromoCode}
    />
  );
};

export default PricingPageWrapper;

