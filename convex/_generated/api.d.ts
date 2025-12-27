/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as analytics from "../analytics.js";
import type * as articles from "../articles.js";
import type * as auth from "../auth.js";
import type * as authUtils from "../authUtils.js";
import type * as cancellations from "../cancellations.js";
import type * as damageAssessment from "../damageAssessment.js";
import type * as diagnostics from "../diagnostics.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as onboarding from "../onboarding.js";
import type * as payments from "../payments.js";
import type * as propiq from "../propiq.js";
import type * as referrals from "../referrals.js";
import type * as seedArticles from "../seedArticles.js";
import type * as sessions from "../sessions.js";
import type * as support from "../support.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  analytics: typeof analytics;
  articles: typeof articles;
  auth: typeof auth;
  authUtils: typeof authUtils;
  cancellations: typeof cancellations;
  damageAssessment: typeof damageAssessment;
  diagnostics: typeof diagnostics;
  emails: typeof emails;
  http: typeof http;
  onboarding: typeof onboarding;
  payments: typeof payments;
  propiq: typeof propiq;
  referrals: typeof referrals;
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
