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
import { type QueryClient, useMutation, useQuery } from "@tanstack/react-query"

export const useBillingPlans = (
  adapter: BillingAdapter,
  scope?: BillingScope,
  queryClient?: QueryClient
) => useQuery(billingPlansOptions(adapter, scope), queryClient)

export const useBillingState = (
  adapter: BillingAdapter,
  scope?: BillingScope,
  queryClient?: QueryClient
) => useQuery(billingStateOptions(adapter, scope), queryClient)

export const useBillingCheckout = (
  adapter: BillingAdapter,
  scope: BillingScope,
  queryClient?: QueryClient
) => useMutation(billingCheckoutOptions(adapter, scope), queryClient)

export const useBillingPortal = (
  adapter: BillingAdapter,
  scope: BillingScope,
  queryClient?: QueryClient
) => useMutation(billingPortalOptions(adapter, scope), queryClient)

export const useCancelBillingSubscription = (
  adapter: BillingAdapter,
  scope: BillingScope,
  queryClient?: QueryClient
) => useMutation(cancelBillingSubscriptionOptions(adapter, scope), queryClient)

export const useRestoreBillingSubscription = (
  adapter: BillingAdapter,
  scope: BillingScope,
  queryClient?: QueryClient
) => useMutation(restoreBillingSubscriptionOptions(adapter, scope), queryClient)

export const useUpdateBillingSeats = (
  adapter: BillingAdapter,
  scope: BillingScope,
  queryClient?: QueryClient
) => useMutation(updateBillingSeatsOptions(adapter, scope), queryClient)
