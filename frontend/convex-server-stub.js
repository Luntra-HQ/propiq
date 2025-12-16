/**
 * Stub for convex/server module
 * This file provides mock implementations for browser builds
 * The actual convex/server module only works in Node.js environments
 */

// Create a proxy that returns itself for any property access
// This prevents "[object Object] is not a function" errors
const createDeepProxy = (name = 'ConvexStub') => {
  return new Proxy(() => {}, {
    get: (target, prop) => {
      if (prop === 'toString' || prop === Symbol.toStringTag) {
        return () => name;
      }
      // Return another proxy for nested access
      return createDeepProxy(`${name}.${String(prop)}`);
    },
    apply: () => {
      // If called as a function, return another proxy
      return createDeepProxy(name);
    }
  });
};

// Export proxies that can handle any access pattern
export const anyApi = createDeepProxy('anyApi');
export const componentsGeneric = createDeepProxy('componentsGeneric');
export const defineSchema = createDeepProxy('defineSchema');
export const defineTable = createDeepProxy('defineTable');
export const httpRouter = createDeepProxy('httpRouter');

// Export common Convex types that might be imported
export const v = createDeepProxy('v');
export const query = createDeepProxy('query');
export const mutation = createDeepProxy('mutation');
export const action = createDeepProxy('action');
export const internalQuery = createDeepProxy('internalQuery');
export const internalMutation = createDeepProxy('internalMutation');
export const internalAction = createDeepProxy('internalAction');
