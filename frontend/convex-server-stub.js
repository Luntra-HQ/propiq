/**
 * Stub for convex/server module
 * This file provides mock implementations for browser builds
 * The actual convex/server module only works in Node.js environments
 *
 * We create function reference objects that match the Convex API structure
 */

// Helper to create a function reference
const createFunctionRef = (moduleName, functionName) => ({
  _type: 'function',
  _module: moduleName,
  _function: functionName,
});

// Build API structure based on your Convex modules
export const anyApi = {
  auth: {
    signup: createFunctionRef('auth', 'signup'),
    login: createFunctionRef('auth', 'login'),
    getUser: createFunctionRef('auth', 'getUser'),
    getUserByEmail: createFunctionRef('auth', 'getUserByEmail'),
    updateProfile: createFunctionRef('auth', 'updateProfile'),
  },
  payments: {
    createCheckoutSession: createFunctionRef('payments', 'createCheckoutSession'),
    handleWebhook: createFunctionRef('payments', 'handleWebhook'),
    getSubscription: createFunctionRef('payments', 'getSubscription'),
  },
  propiq: {
    analyzeProperty: createFunctionRef('propiq', 'analyzeProperty'),
    getAnalysisHistory: createFunctionRef('propiq', 'getAnalysisHistory'),
  },
  support: {
    sendMessage: createFunctionRef('support', 'sendMessage'),
    getConversations: createFunctionRef('support', 'getConversations'),
  },
};

export const componentsGeneric = () => ({});
export const defineSchema = () => ({});
export const defineTable = () => ({});
export const httpRouter = () => ({});
