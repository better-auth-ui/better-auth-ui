import { type QueryOptions, skipToken } from "@tanstack/query-core"
import type {
  BillingAdapter,
  BillingPlan,
  BillingScope,
  BillingState
} from "./billing-adapter"
import { billingScopeKey } from "./billing-adapter"

export const billingQueryKeys = {
  all: ["auth", "billing"] as const,
  scope: (scope: BillingScope) =>
    [...billingQueryKeys.all, billingScopeKey(scope)] as const,
  plans: (scope: BillingScope) =>
    [...billingQueryKeys.scope(scope), "plans"] as const,
  state: (scope: BillingScope) =>
    [...billingQueryKeys.scope(scope), "state"] as const
} as const

export const billingPlansOptions = (
  adapter: BillingAdapter,
  scope: BillingScope | undefined
) =>
  ({
    queryKey: scope
      ? billingQueryKeys.plans(scope)
      : [...billingQueryKeys.all, null, "plans"],
    queryFn: scope
      ? ({ signal }) => adapter.listPlans(scope, signal)
      : skipToken
  }) satisfies QueryOptions<BillingPlan[]>

export const billingStateOptions = (
  adapter: BillingAdapter,
  scope: BillingScope | undefined
) =>
  ({
    queryKey: scope
      ? billingQueryKeys.state(scope)
      : [...billingQueryKeys.all, null, "state"],
    queryFn: scope ? ({ signal }) => adapter.getState(scope, signal) : skipToken
  }) satisfies QueryOptions<BillingState>
