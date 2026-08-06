import {
  type OrganizationAuthClient,
  organizationQueryKeys,
  type SetActiveOrganizationOptions,
  type SetActiveOrganizationParams,
  setActiveOrganizationOptions
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  useMutation,
  useQueryClient
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"
import { useListOrganizations } from "../queries"

type SetActiveOrganizationVariables<
  TAuthClient extends OrganizationAuthClient
> = SetActiveOrganizationParams<TAuthClient> & {
  organizationId?: string | null
  organizationSlug?: string
}

/**
 * Reactive mutation options accessor for `useSetActiveOrganization`.
 */
export type UseSetActiveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = Accessor<SetActiveOrganizationOptions<TAuthClient>>

/**
 * Solid mutation hook for setting the active organization.
 *
 * @param authClient - The Better Auth client.
 * @param options - Reactive mutation options merged with the core mutation options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
export function useSetActiveOrganization<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: UseSetActiveOrganizationOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  const mutationQueryClient = useQueryClient(queryClient?.())
  const userId = () => session.data?.user.id
  const organizationsQuery = useListOrganizations(
    authClient,
    undefined,
    queryClient
  )

  return useMutation(() => {
    const mutationOptions = options?.() ?? {}

    return {
      ...setActiveOrganizationOptions(authClient, userId()),
      ...mutationOptions,
      onMutate: async (
        variables: SetActiveOrganizationVariables<TAuthClient>,
        context
      ) => {
        // Cancel any outgoing refetches across every slug-partitioned
        // active-organization cache entry so they don't overwrite our
        // optimistic update.
        await mutationQueryClient.cancelQueries({
          queryKey: organizationQueryKeys.activeOrganizations(userId())
        })

        // Snapshot every slug-partitioned variant so the rollback hits
        // whichever cache entry the UI is actually subscribed to.
        const previousOrganizations = mutationQueryClient.getQueriesData({
          queryKey: organizationQueryKeys.activeOrganizations(userId())
        })

        // Optimistically update to the new value
        if (variables?.organizationId === null) {
          mutationQueryClient.setQueriesData(
            { queryKey: organizationQueryKeys.activeOrganizations(userId()) },
            null
          )

          const userOnMutateResult = await mutationOptions.onMutate?.(
            variables,
            context
          )

          return { previousOrganizations, userOnMutateResult }
        }

        const newOrganization = organizationsQuery.data?.find(
          (org: { id?: string; slug?: string }) =>
            (variables?.organizationId !== undefined &&
              org.id === variables.organizationId) ||
            (variables?.organizationSlug !== undefined &&
              org.slug === variables.organizationSlug)
        )

        if (newOrganization) {
          mutationQueryClient.setQueriesData(
            { queryKey: organizationQueryKeys.activeOrganizations(userId()) },
            newOrganization
          )
        }

        const userOnMutateResult = await mutationOptions.onMutate?.(
          variables,
          context
        )

        return { previousOrganizations, userOnMutateResult }
      },
      onSuccess: async (data, variables, onMutateResult, context) => {
        await mutationOptions.onSuccess?.(
          data,
          variables,
          onMutateResult?.userOnMutateResult,
          context
        )
      },
      // If the mutation fails, use the result returned from onMutate to roll back
      onError: async (error, variables, onMutateResult, context) => {
        const previousOrganizations = onMutateResult?.previousOrganizations

        if (previousOrganizations?.length) {
          for (const [queryKey, data] of previousOrganizations) {
            mutationQueryClient.setQueryData(queryKey, data)
          }
        }

        await mutationOptions.onError?.(
          error,
          variables,
          onMutateResult?.userOnMutateResult,
          context
        )
      },
      // Always refetch after error or success — invalidate every
      // slug-partitioned variant via the broader prefix.
      onSettled: async (data, error, variables, onMutateResult, context) => {
        await mutationQueryClient.invalidateQueries({
          queryKey: organizationQueryKeys.activeOrganizations(userId())
        })

        await mutationOptions.onSettled?.(
          data,
          error,
          variables,
          onMutateResult?.userOnMutateResult,
          context
        )
      }
    }
  }, queryClient)
}
