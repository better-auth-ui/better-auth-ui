import {
  type BillingAdapter,
  type BillingScope,
  billingCheckoutOptions,
  billingPlansOptions,
  billingPortalOptions,
  billingStateOptions,
  cancelBillingSubscriptionOptions,
  restoreBillingSubscriptionOptions,
  updateBillingSeatsOptions
} from "@better-auth-ui/core/plugins/billing"
import { type QueryClient, useMutation, useQuery } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export const useBillingPlans = (
  adapter: BillingAdapter,
  scope: Accessor<BillingScope | undefined>,
  queryClient?: Accessor<QueryClient>
) => useQuery(() => billingPlansOptions(adapter, scope()), queryClient)

export const useBillingState = (
  adapter: BillingAdapter,
  scope: Accessor<BillingScope | undefined>,
  queryClient?: Accessor<QueryClient>
) => useQuery(() => billingStateOptions(adapter, scope()), queryClient)

type Scope = Accessor<BillingScope>

export const useBillingCheckout = (
  adapter: BillingAdapter,
  scope: Scope,
  queryClient?: Accessor<QueryClient>
) => useMutation(() => billingCheckoutOptions(adapter, scope()), queryClient)

export const useBillingPortal = (
  adapter: BillingAdapter,
  scope: Scope,
  queryClient?: Accessor<QueryClient>
) => useMutation(() => billingPortalOptions(adapter, scope()), queryClient)

export const useCancelBillingSubscription = (
  adapter: BillingAdapter,
  scope: Scope,
  queryClient?: Accessor<QueryClient>
) =>
  useMutation(
    () => cancelBillingSubscriptionOptions(adapter, scope()),
    queryClient
  )

export const useRestoreBillingSubscription = (
  adapter: BillingAdapter,
  scope: Scope,
  queryClient?: Accessor<QueryClient>
) =>
  useMutation(
    () => restoreBillingSubscriptionOptions(adapter, scope()),
    queryClient
  )

export const useUpdateBillingSeats = (
  adapter: BillingAdapter,
  scope: Scope,
  queryClient?: Accessor<QueryClient>
) => useMutation(() => updateBillingSeatsOptions(adapter, scope()), queryClient)
