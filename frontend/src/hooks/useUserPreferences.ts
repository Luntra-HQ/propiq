/**
 * useUserPreferences Hook - 2025 Design System
 *
 * Persists user preferences to localStorage for personalization.
 * Provides a consistent interface for storing and retrieving preferences.
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'propiq_user_preferences';

interface RecentAnalysis {
  id: string;
  address: string;
  city: string;
  state: string;
  score: number;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid';
  analyzedAt: string; // ISO date string
}

interface OnboardingProgress {
  tourCompleted: boolean;
  firstAnalysisCompleted: boolean;
  calculatorUsed: boolean;
  profileCompleted: boolean;
  dismissedAt?: string;
}

interface UserPreferences {
  // Display preferences
  theme: 'dark' | 'light' | 'system';
  compactMode: boolean;
  showWelcomeBanner: boolean;

  // Analysis preferences
  defaultPropertyType: 'single_family' | 'multi_family' | 'condo' | 'townhouse';
  defaultDownPaymentPercent: number;
  defaultInterestRate: number;
  preferredMarkets: string[];

  // History
  recentAnalyses: RecentAnalysis[];
  favoriteProperties: string[];

  // Onboarding
  onboarding: OnboardingProgress;

  // Notifications
  emailNotifications: boolean;
  usageAlerts: boolean;

  // Last updated
  lastUpdated: string;
}

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  compactMode: false,
  showWelcomeBanner: true,

  defaultPropertyType: 'single_family',
  defaultDownPaymentPercent: 20,
  defaultInterestRate: 7.0,
  preferredMarkets: [],

  recentAnalyses: [],
  favoriteProperties: [],

  onboarding: {
    tourCompleted: false,
    firstAnalysisCompleted: false,
    calculatorUsed: false,
    profileCompleted: false,
  },

  emailNotifications: true,
  usageAlerts: true,

  lastUpdated: new Date().toISOString(),
};

export const useUserPreferences = () => {
  const [preferences, setPreferencesState] = useState<UserPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferencesState({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever preferences change
  const savePreferences = useCallback((newPreferences: UserPreferences) => {
    try {
      const updated = { ...newPreferences, lastUpdated: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setPreferencesState(updated);
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }, []);

  // Update a single preference
  const setPreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferencesState((prev) => {
      const updated = { ...prev, [key]: value };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  // Update multiple preferences at once
  const setPreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferencesState((prev) => {
      const updated = { ...prev, ...updates };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  // Add a recent analysis
  const addRecentAnalysis = useCallback((analysis: Omit<RecentAnalysis, 'analyzedAt'>) => {
    setPreferencesState((prev) => {
      const newAnalysis: RecentAnalysis = {
        ...analysis,
        analyzedAt: new Date().toISOString(),
      };

      // Keep only last 20 analyses, remove duplicates by id
      const filtered = prev.recentAnalyses.filter((a) => a.id !== analysis.id);
      const updated = {
        ...prev,
        recentAnalyses: [newAnalysis, ...filtered].slice(0, 20),
        onboarding: {
          ...prev.onboarding,
          firstAnalysisCompleted: true,
        },
      };

      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  // Toggle favorite property
  const toggleFavorite = useCallback((propertyId: string) => {
    setPreferencesState((prev) => {
      const isFavorite = prev.favoriteProperties.includes(propertyId);
      const updated = {
        ...prev,
        favoriteProperties: isFavorite
          ? prev.favoriteProperties.filter((id) => id !== propertyId)
          : [...prev.favoriteProperties, propertyId],
      };

      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  // Mark onboarding step as complete
  const completeOnboardingStep = useCallback((step: keyof OnboardingProgress) => {
    setPreferencesState((prev) => {
      if (step === 'dismissedAt') return prev;

      const updated = {
        ...prev,
        onboarding: {
          ...prev.onboarding,
          [step]: true,
        },
      };

      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  // Dismiss onboarding
  const dismissOnboarding = useCallback(() => {
    setPreferencesState((prev) => {
      const updated = {
        ...prev,
        onboarding: {
          ...prev.onboarding,
          dismissedAt: new Date().toISOString(),
        },
      };

      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  // Clear all preferences (reset)
  const clearPreferences = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setPreferencesState(defaultPreferences);
    } catch (error) {
      console.error('Failed to clear user preferences:', error);
    }
  }, []);

  // Check if user is new (no analyses, onboarding not complete)
  const isNewUser = !preferences.onboarding.firstAnalysisCompleted &&
    !preferences.onboarding.tourCompleted &&
    !preferences.onboarding.dismissedAt;

  // Check if onboarding should be shown
  const shouldShowOnboarding = isNewUser ||
    (!preferences.onboarding.dismissedAt && (
      !preferences.onboarding.tourCompleted ||
      !preferences.onboarding.firstAnalysisCompleted
    ));

  return {
    preferences,
    isLoaded,
    isNewUser,
    shouldShowOnboarding,

    // Setters
    setPreference,
    setPreferences,

    // Analysis helpers
    addRecentAnalysis,
    toggleFavorite,

    // Onboarding helpers
    completeOnboardingStep,
    dismissOnboarding,

    // Reset
    clearPreferences,
  };
};

export type { UserPreferences, RecentAnalysis, OnboardingProgress };
export default useUserPreferences;
