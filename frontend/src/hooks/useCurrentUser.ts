/**
 * useCurrentUser Hook
 * Fetches the current user from Convex based on localStorage userId
 *
 * This replaces the broken getUserDetails() that was returning cached data
 *
 * FIX: Now uses getUserById which accepts a string, fixing the type mismatch
 * where localStorage stores string but v.id("users") expected Convex ID type
 */

import { useQuery } from 'convex/react';

// User type matching what Convex returns
export interface ConvexUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  subscriptionTier: string;
  analysesUsed: number;
  analysesLimit: number;
  active: boolean;
  emailVerified: boolean;
  createdAt: number;
  lastLogin?: number;
  updatedAt?: number;
}

/**
 * Safely get item from localStorage with error handling
 */
function safeGetStoredUserId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem('propiq_user_id');
  } catch (e) {
    console.error('[useCurrentUser] localStorage access failed:', e);
    return null;
  }
}

/**
 * Hook to get the current authenticated user from Convex
 * Returns:
 * - undefined: Query is still loading
 * - null: No user found (invalid/stale session) or no stored userId
 * - ConvexUser: User data from Convex
 */
export function useCurrentUser(): ConvexUser | null | undefined {
  // Get userId from localStorage safely
  const storedUserId = safeGetStoredUserId();

  // Use getUserById which accepts a string (fixes type mismatch)
  // 'skip' tells Convex to not run the query if we don't have a userId
  const user = useQuery(
    'auth:getUserById' as any,
    storedUserId ? { userIdString: storedUserId } : 'skip'
  );

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('[useCurrentUser] storedUserId:', storedUserId);
    console.log('[useCurrentUser] query result:', user);
  }

  return user as ConvexUser | null | undefined;
}

/**
 * Check if we have a stored user ID in localStorage
 */
export function hasStoredUserId(): boolean {
  return !!safeGetStoredUserId();
}
