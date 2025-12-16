/**
 * Minimal stub for convex/server module
 * This file provides NO-OP exports for browser builds
 * The actual convex/server module only works in Node.js environments
 *
 * This stub is intentionally minimal - it just exports null for everything.
 * The ConvexReactClient handles all the actual Convex functionality in the browser.
 */

// Export null for everything - Convex client handles the real work
export const anyApi = null;
export const componentsGeneric = () => null;
export const defineSchema = () => null;
export const defineTable = () => null;
export const httpRouter = () => null;

// Common Convex types
export const v = null;
export const query = null;
export const mutation = null;
export const action = null;
export const internalQuery = null;
export const internalMutation = null;
export const internalAction = null;
