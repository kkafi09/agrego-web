/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as allocations from "../allocations.js";
import type * as auth from "../auth.js";
import type * as contracts from "../contracts.js";
import type * as dashboard from "../dashboard.js";
import type * as deposits from "../deposits.js";
import type * as koperasi from "../koperasi.js";
import type * as masterData from "../masterData.js";
import type * as notifications from "../notifications.js";
import type * as qualityChecks from "../qualityChecks.js";
import type * as reports from "../reports.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  allocations: typeof allocations;
  auth: typeof auth;
  contracts: typeof contracts;
  dashboard: typeof dashboard;
  deposits: typeof deposits;
  koperasi: typeof koperasi;
  masterData: typeof masterData;
  notifications: typeof notifications;
  qualityChecks: typeof qualityChecks;
  reports: typeof reports;
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
