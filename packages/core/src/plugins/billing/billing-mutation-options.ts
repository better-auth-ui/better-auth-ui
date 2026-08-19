import type { MutationOptions } from "@tanstack/query-core"
import type {
  BillingActionResult,
  BillingAdapter,
  BillingCheckoutInput,
  BillingScope
} from "./billing-adapter"
import { billingScopeKey } from "./billing-adapter"
import { billingQueryKeys } from "./billing-query-options"

export const billingMutationKeys = {
  all: ["auth", "billing"] as const,
  checkout: (scope: BillingScope) =>
    [...billingMutationKeys.all, billingScopeKey(scope), "checkout"] as const,
  portal: (scope: BillingScope) =>
    [...billingMutationKeys.all, billingScopeKey(scope), "portal"] as const,
  cancel: (scope: BillingScope) =>
    [...billingMutationKeys.all, billingScopeKey(scope), "cancel"] as const,
  restore: (scope: BillingScope) =>
    [...billingMutationKeys.all, billingScopeKey(scope), "restore"] as const,
  seats: (scope: BillingScope) =>
    [...billingMutationKeys.all, billingScopeKey(scope), "seats"] as const
} as const

const stateMeta = (scope: BillingScope) => ({
  awaits: [billingQueryKeys.state(scope)]
})

export const billingCheckoutOptions = (
  adapter: BillingAdapter,
  scope: BillingScope
) =>
  ({
    mutationKey: billingMutationKeys.checkout(scope),
    mutationFn: (input: BillingCheckoutInput) => adapter.checkout(scope, input),
    meta: stateMeta(scope)
  }) satisfies MutationOptions<BillingActionResult, Error, BillingCheckoutInput>

export const billingPortalOptions = (
  adapter: BillingAdapter,
  scope: BillingScope
) =>
  ({
    mutationKey: billingMutationKeys.portal(scope),
    mutationFn: () => adapter.openPortal(scope)
  }) satisfies MutationOptions<BillingActionResult, Error, void>

export const cancelBillingSubscriptionOptions = (
  adapter: BillingAdapter,
  scope: BillingScope
) =>
  ({
    mutationKey: billingMutationKeys.cancel(scope),
    mutationFn: (subscriptionId: string) =>
      adapter.cancel(scope, subscriptionId),
    meta: stateMeta(scope)
  }) satisfies MutationOptions<BillingActionResult, Error, string>

export const restoreBillingSubscriptionOptions = (
  adapter: BillingAdapter,
  scope: BillingScope
) =>
  ({
    mutationKey: billingMutationKeys.restore(scope),
    mutationFn: (subscriptionId: string) =>
      adapter.restore(scope, subscriptionId),
    meta: stateMeta(scope)
  }) satisfies MutationOptions<BillingActionResult, Error, string>

export type UpdateBillingSeatsVariables = {
  subscriptionId: string
  seats: number
}

export const updateBillingSeatsOptions = (
  adapter: BillingAdapter,
  scope: BillingScope
) =>
  ({
    mutationKey: billingMutationKeys.seats(scope),
    mutationFn: ({ subscriptionId, seats }: UpdateBillingSeatsVariables) =>
      adapter.updateSeats(scope, subscriptionId, seats),
    meta: stateMeta(scope)
  }) satisfies MutationOptions<
    BillingActionResult,
    Error,
    UpdateBillingSeatsVariables
  >
