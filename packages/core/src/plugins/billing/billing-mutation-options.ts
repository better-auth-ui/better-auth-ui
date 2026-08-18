import type { MutationOptions } from "@tanstack/query-core"
import type {
  BillingActionResult,
  BillingAdapter,
  BillingCheckoutInput,
  BillingScope
} from "./billing-adapter"
import { billingQueryKeys } from "./billing-query-options"

export const billingMutationKeys = {
  all: ["auth", "billing"] as const,
  checkout: ["auth", "billing", "checkout"] as const,
  portal: ["auth", "billing", "portal"] as const,
  cancel: ["auth", "billing", "cancel"] as const,
  restore: ["auth", "billing", "restore"] as const,
  seats: ["auth", "billing", "seats"] as const
} as const

const stateMeta = (scope: BillingScope) => ({
  awaits: [billingQueryKeys.state(scope)]
})

export const billingCheckoutOptions = (
  adapter: BillingAdapter,
  scope: BillingScope
) =>
  ({
    mutationKey: billingMutationKeys.checkout,
    mutationFn: (input: BillingCheckoutInput) => adapter.checkout(scope, input),
    meta: stateMeta(scope)
  }) satisfies MutationOptions<BillingActionResult, Error, BillingCheckoutInput>

export const billingPortalOptions = (
  adapter: BillingAdapter,
  scope: BillingScope
) =>
  ({
    mutationKey: billingMutationKeys.portal,
    mutationFn: () => adapter.openPortal(scope)
  }) satisfies MutationOptions<BillingActionResult, Error, void>

export const cancelBillingSubscriptionOptions = (
  adapter: BillingAdapter,
  scope: BillingScope
) =>
  ({
    mutationKey: billingMutationKeys.cancel,
    mutationFn: (subscriptionId: string) =>
      adapter.cancel(scope, subscriptionId),
    meta: stateMeta(scope)
  }) satisfies MutationOptions<BillingActionResult, Error, string>

export const restoreBillingSubscriptionOptions = (
  adapter: BillingAdapter,
  scope: BillingScope
) =>
  ({
    mutationKey: billingMutationKeys.restore,
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
    mutationKey: billingMutationKeys.seats,
    mutationFn: ({ subscriptionId, seats }: UpdateBillingSeatsVariables) =>
      adapter.updateSeats(scope, subscriptionId, seats),
    meta: stateMeta(scope)
  }) satisfies MutationOptions<
    BillingActionResult,
    Error,
    UpdateBillingSeatsVariables
  >
