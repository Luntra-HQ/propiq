/**
 * Minimal stub for convex/server module
 * This file provides NO-OP exports for browser builds
 * The actual convex/server module only works in Node.js environments
 *
 * This stub is intentionally minimal - it just exports null for everything.
 * The ConvexReactClient handles all the actual Convex functionality in the browser.
 */

/**
 * These need to be FUNCTIONS, not null, because backend code gets bundled
 * and tries to call them (e.g., query(), mutation())
 */

// Throw helpful error if Convex server functions are called in browser
const throwServerError = (fnName) => {
  throw new Error(
    `Convex ${fnName} called in browser context. This is a server-only function. ` +
    `Make sure you're using the Convex React client (useQuery, useMutation, useAction) instead.`
  );
};

// Schema/Router functions (return no-op functions)
export const defineSchema = () => ({});
export const defineTable = () => ({});
export const httpRouter = () => ({});

// Validation builder (v) - return proxy that returns itself for chaining
export const v = new Proxy(() => v, {
  get: () => v,
  apply: () => v
});

// Server function builders - return no-op wrappers
export const query = () => ({ handler: () => null });
export const mutation = () => ({ handler: () => null });
export const action = () => ({ handler: () => null });
export const internalQuery = () => ({ handler: () => null });
export const internalMutation = () => ({ handler: () => null });
export const internalAction = () => ({ handler: () => null });

// Generic versions
export const queryGeneric = () => ({ handler: () => null });
export const mutationGeneric = () => ({ handler: () => null });
export const actionGeneric = () => ({ handler: () => null });
export const httpActionGeneric = () => ({ handler: () => null });
export const internalQueryGeneric = () => ({ handler: () => null });
export const internalMutationGeneric = () => ({ handler: () => null });
export const internalActionGeneric = () => ({ handler: () => null });

// API generation functions
export const makeApi = (modules) => {
  const api = {};
  for (const [mod, name] of modules) {
    api[name] = mod;
  }
  return api;
};

export const makeComponent = () => ({});
export const anyApi = {};
export const componentsGeneric = () => ({});
