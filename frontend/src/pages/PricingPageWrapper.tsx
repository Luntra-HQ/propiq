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

  // Use string reference instead of api.payments.createCheckoutSession
  // This bypasses anyApi proxy issues in production builds
  const createCheckout = useAction("payments:createCheckoutSession" as any);

  // Sync user data
  useEffect(() => {
    if (!isLoading && user) {
      setUserId(user._id);
      setCurrentTier(user.subscriptionTier || 'free');
    }
  }, [user, isLoading]);

  const handleSelectTier = useCallback(async (tierId: string) => {
    console.log(`[PRICING] Upgrading to tier: ${tierId}`);

    // Redirect to login if not authenticated
    if (!user || !userId) {
      console.log('[PRICING] User not authenticated, redirecting to login');
      sessionStorage.setItem('selectedTier', tierId);
      sessionStorage.setItem('checkoutIntent', 'true');
      alert(
        "Please sign up or log in to complete your purchase. You'll be automatically redirected to checkout after signing in."
      );
      navigate(`/login?redirect=/pricing&tier=${tierId}`);
      return;
    }

    try {
      console.log('[PRICING] Creating Stripe checkout session...');
      const result = await createCheckout({
        userId: userId as Id<'users'>,
        tier: tierId,
        successUrl: `${window.location.origin}/app?upgrade=success`,
        cancelUrl: `${window.location.origin}/pricing`,
      });

      if (result?.success && result.url) {
        console.log('[PRICING] Redirecting to Stripe checkout:', result.sessionId);
        window.location.href = result.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('[PRICING] Stripe checkout error:', error);
      alert(`Checkout Error: ${error?.message || 'Unable to start checkout. Please try again.'}`);
    }
  }, [user, userId, createCheckout, navigate]);

  // Auto-trigger checkout if user just logged in with a selected tier
  useEffect(() => {
    if (!isLoading && user && userId) {
      const selectedTier = sessionStorage.getItem('selectedTier');
      const checkoutIntent = sessionStorage.getItem('checkoutIntent');
      if (selectedTier && checkoutIntent) {
        console.log(`[PRICING] Auto-triggering checkout for tier: ${selectedTier}`);
        sessionStorage.removeItem('selectedTier');
        sessionStorage.removeItem('checkoutIntent');
        setTimeout(() => {
          console.log(`[PRICING] Executing auto-checkout for: ${selectedTier}`);
          handleSelectTier(selectedTier);
        }, 500);
      }
    }
  }, [user, userId, isLoading, handleSelectTier]);

  const handleClose = () => {
    if (user) navigate('/app');
    else navigate('/');
  };

  return (
    <PricingPage
      currentTier={currentTier}
      onSelectTier={handleSelectTier}
      onClose={handleClose}
    />
  );
};

export default PricingPageWrapper;

