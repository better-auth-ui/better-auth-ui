import {
  organizationMutationKeys,
  organizationQueryKeys
} from "@better-auth-ui/core/plugins"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { useSession } from "../../hooks/queries/use-session"
import type { OrganizationAuthClient } from "../../lib/auth-client"
import { useListOrganizations } from "../../queries/organization"

export type SetActiveOrganizationParams<
  TAuthClient extends OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["setActive"]>[0]

export type SetActiveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = Omit<
  ReturnType<typeof setActiveOrganizationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export function setActiveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient) {
  const mutationKey = organizationMutationKeys.setActive

  const mutationFn = (params: SetActiveOrganizationParams<TAuthClient>) =>
    authClient.organization.setActive({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return mutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >({
    mutationKey,
    mutationFn
  })
}

export function useSetActiveOrganization<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: SetActiveOrganizationOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id
  const { data: organizations } = useListOrganizations(
    authClient,
    undefined,
    queryClient
  )

  return useMutation(
    {
      ...setActiveOrganizationOptions(authClient),
      ...options,
      onMutate: async (variables, context) => {
        // Cancel any outgoing refetches across every slug-partitioned
        // active-organization cache entry so they don't overwrite our
        // optimistic update.
        await context.client.cancelQueries({
          queryKey: organizationQueryKeys.activeOrganizations(userId)
        })

        // Snapshot every slug-partitioned variant so the rollback hits
        // whichever cache entry the UI is actually subscribed to (the
        // entry's key is `[..., 'active', { organizationSlug }]` when the
        // plugin's slug option is set, and `[..., 'active', null]`
        // otherwise).
        const previousOrganizations = context.client.getQueriesData({
          queryKey: organizationQueryKeys.activeOrganizations(userId)
        })

        // Optimistically update to the new value
        if (variables?.organizationId === null) {
          context.client.setQueriesData(
            { queryKey: organizationQueryKeys.activeOrganizations(userId) },
            null
          )

          return { previousOrganizations }
        }

        const newOrganization = organizations?.find(
          (organization) =>
            (variables?.organizationId !== undefined &&
              organization.id === variables.organizationId) ||
            (variables?.organizationSlug !== undefined &&
              organization.slug === variables.organizationSlug)
        )

        if (newOrganization) {
          context.client.setQueriesData(
            { queryKey: organizationQueryKeys.activeOrganizations(userId) },
            newOrganization
          )
        }

        return { previousOrganizations }
      },
      // If the mutation fails,
      // use the result returned from onMutate to roll back
      onError: (error, variables, onMutateResult, context) => {
        const previousOrganizations = onMutateResult?.previousOrganizations

        if (previousOrganizations?.length && error.error) {
          for (const [queryKey, data] of previousOrganizations) {
            context.client.setQueryData(queryKey, data)
          }
        }

        return options?.onError?.(error, variables, onMutateResult, context)
      },
      // Always refetch after error or success — invalidate every
      // slug-partitioned variant via the broader prefix.
      onSettled: async (data, error, variables, onMutateResult, context) => {
        await context.client.invalidateQueries({
          queryKey: organizationQueryKeys.activeOrganizations(userId)
        })

        return options?.onSettled?.(
          data,
          error,
          variables,
          onMutateResult,
          context
        )
      }
    },
    queryClient
  )
}
