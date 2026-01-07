/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminCleanup from "../adminCleanup.js";
import type * as articles from "../articles.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as emailScheduler from "../emailScheduler.js";
import type * as http from "../http.js";
import type * as leads from "../leads.js";
import type * as logger from "../logger.js";
import type * as migrateLeadCaptures from "../migrateLeadCaptures.js";
import type * as onboarding from "../onboarding.js";
import type * as onboardingEmailScheduler from "../onboardingEmailScheduler.js";
import type * as payments from "../payments.js";
import type * as propiq from "../propiq.js";
import type * as s3Upload from "../s3Upload.js";
import type * as seedArticles from "../seedArticles.js";
import type * as sessions from "../sessions.js";
import type * as support from "../support.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminCleanup: typeof adminCleanup;
  articles: typeof articles;
  auth: typeof auth;
  crons: typeof crons;
  emailScheduler: typeof emailScheduler;
  http: typeof http;
  leads: typeof leads;
  logger: typeof logger;
  migrateLeadCaptures: typeof migrateLeadCaptures;
  onboarding: typeof onboarding;
  onboardingEmailScheduler: typeof onboardingEmailScheduler;
  payments: typeof payments;
  propiq: typeof propiq;
  s3Upload: typeof s3Upload;
  seedArticles: typeof seedArticles;
  sessions: typeof sessions;
  support: typeof support;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
