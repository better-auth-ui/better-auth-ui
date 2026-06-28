import {
  type OrganizationAuthClient,
  organizationQueryKeys,
  type SetActiveOrganizationOptions,
  type SetActiveOrganizationParams,
  setActiveOrganizationOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"
import { useListOrganizations } from "../queries"

type SetActiveOrganizationVariables<
  TAuthClient extends OrganizationAuthClient
> = SetActiveOrganizationParams<TAuthClient> & {
  organizationId?: string | null
  organizationSlug?: string
}

export function useSetActiveOrganization<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
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
      ...setActiveOrganizationOptions(authClient, userId),
      ...options,
      onMutate: async (
        variables: SetActiveOrganizationVariables<TAuthClient>,
        context
      ) => {
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
