import {
  type BillingActionResult,
  type BillingAdapter,
  type BillingScope,
  type BillingState,
  billingCheckoutOptions,
  billingPlansOptions,
  billingPortalOptions,
  billingStateOptions,
  cancelBillingSubscriptionOptions,
  restoreBillingSubscriptionOptions,
  updateBillingSeatsOptions
} from "@better-auth-ui/core/plugins/billing"
import {
  type QueryClient,
  useMutation,
  type UseMutationResult,
  useQuery,
  type UseQueryResult
} from "@tanstack/solid-query"
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
): UseQueryResult<BillingState> =>
  useQuery(() => billingStateOptions(adapter, scope()), queryClient)

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
): UseMutationResult<BillingActionResult, Error, void> =>
  useMutation(() => billingPortalOptions(adapter, scope()), queryClient)

export const useCancelBillingSubscription = (
  adapter: BillingAdapter,
  scope: Scope,
  queryClient?: Accessor<QueryClient>
): UseMutationResult<BillingActionResult, Error, string> =>
  useMutation(
    () => cancelBillingSubscriptionOptions(adapter, scope()),
    queryClient
  )

export const useRestoreBillingSubscription = (
  adapter: BillingAdapter,
  scope: Scope,
  queryClient?: Accessor<QueryClient>
): UseMutationResult<BillingActionResult, Error, string> =>
  useMutation(
    () => restoreBillingSubscriptionOptions(adapter, scope()),
    queryClient
  )

export const useUpdateBillingSeats = (
  adapter: BillingAdapter,
  scope: Scope,
  queryClient?: Accessor<QueryClient>
) => useMutation(() => updateBillingSeatsOptions(adapter, scope()), queryClient)
