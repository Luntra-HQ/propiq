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
import type * as backfillLeads from "../backfillLeads.js";
import type * as blog from "../blog.js";
import type * as cancellations from "../cancellations.js";
import type * as crons from "../crons.js";
import type * as dailyMetrics from "../dailyMetrics.js";
import type * as damageAssessment from "../damageAssessment.js";
import type * as diagnostics from "../diagnostics.js";
import type * as emailScheduler from "../emailScheduler.js";
import type * as emails from "../emails.js";
import type * as exports from "../exports.js";
import type * as http from "../http.js";
import type * as http_secure from "../http_secure.js";
import type * as leadMagnet from "../leadMagnet.js";
import type * as leads from "../leads.js";
import type * as monitoring from "../monitoring.js";
import type * as nps from "../nps.js";
import type * as onboarding from "../onboarding.js";
import type * as payments from "../payments.js";
import type * as propiq from "../propiq.js";
import type * as rateLimit from "../rateLimit.js";
import type * as referrals from "../referrals.js";
import type * as schema_additions from "../schema_additions.js";
import type * as seedArticles from "../seedArticles.js";
import type * as seedBlogPosts from "../seedBlogPosts.js";
import type * as seo from "../seo.js";
import type * as sessions from "../sessions.js";
import type * as sharing from "../sharing.js";
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
  backfillLeads: typeof backfillLeads;
  blog: typeof blog;
  cancellations: typeof cancellations;
  crons: typeof crons;
  dailyMetrics: typeof dailyMetrics;
  damageAssessment: typeof damageAssessment;
  diagnostics: typeof diagnostics;
  emailScheduler: typeof emailScheduler;
  emails: typeof emails;
  exports: typeof exports;
  http: typeof http;
  http_secure: typeof http_secure;
  leadMagnet: typeof leadMagnet;
  leads: typeof leads;
  monitoring: typeof monitoring;
  nps: typeof nps;
  onboarding: typeof onboarding;
  payments: typeof payments;
  propiq: typeof propiq;
  rateLimit: typeof rateLimit;
  referrals: typeof referrals;
  schema_additions: typeof schema_additions;
  seedArticles: typeof seedArticles;
  seedBlogPosts: typeof seedBlogPosts;
  seo: typeof seo;
  sessions: typeof sessions;
  sharing: typeof sharing;
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
