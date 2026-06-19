import {
  organizationMutationKeys,
  organizationQueryKeys
} from "@better-auth-ui/core/plugins"
import { createMutation, useQueryClient } from "@tanstack/solid-query"
import { useSession } from "../../hooks/queries/use-session"
import type { OrganizationAuthClient } from "../../lib/auth-client"
import { useListOrganizations } from "../../queries/organization"
import { setActiveOrganizationMeta } from "./metadata"
import {
  createOrganizationMutationOptions,
  type OrganizationMutationOptions
} from "./utils"

export type SetActiveOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["setActive"]>[0]

export type SetActiveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = OrganizationMutationOptions<TAuthClient["organization"]["setActive"]>

export function setActiveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient) {
  return createOrganizationMutationOptions(
    authClient.organization.setActive,
    organizationMutationKeys.setActive
  )
}

export function useSetActiveOrganization<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: SetActiveOrganizationOptions<TAuthClient>
) {
  const session = useSession(authClient)
  const queryClient = useQueryClient()
  const userId = () =>
    (session.data as { user?: { id?: string } } | undefined)?.user?.id
  const organizationsQuery = useListOrganizations(authClient)

  return createMutation(() => ({
    ...createOrganizationMutationOptions(
      authClient.organization.setActive,
      organizationMutationKeys.setActive
    ),
    ...options,
    meta: setActiveOrganizationMeta(userId()),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches across every slug-partitioned
      // active-organization cache entry so they don't overwrite our
      // optimistic update.
      await queryClient.cancelQueries({
        queryKey: organizationQueryKeys.activeOrganizations(userId())
      })

      // Snapshot every slug-partitioned variant so the rollback hits
      // whichever cache entry the UI is actually subscribed to.
      const previousOrganizations = queryClient.getQueriesData({
        queryKey: organizationQueryKeys.activeOrganizations(userId())
      })

      // Optimistically update to the new value
      if (variables?.organizationId === null) {
        queryClient.setQueriesData(
          { queryKey: organizationQueryKeys.activeOrganizations(userId()) },
          null
        )

        return { previousOrganizations }
      }

      const newOrganization = organizationsQuery.data?.find(
        (org: { id?: string; slug?: string }) =>
          (variables?.organizationId !== undefined &&
            org.id === variables.organizationId) ||
          (variables?.organizationSlug !== undefined &&
            org.slug === variables.organizationSlug)
      )

      if (newOrganization) {
        queryClient.setQueriesData(
          { queryKey: organizationQueryKeys.activeOrganizations(userId()) },
          newOrganization
        )
      }

      return { previousOrganizations }
    },
    // If the mutation fails, use the result returned from onMutate to roll back
    onError: (_error, _variables, onMutateResult) => {
      const previousOrganizations = onMutateResult?.previousOrganizations

      if (previousOrganizations?.length) {
        for (const [queryKey, data] of previousOrganizations) {
          queryClient.setQueryData(queryKey, data)
        }
      }
    },
    // Always refetch after error or success — invalidate every
    // slug-partitioned variant via the broader prefix.
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.activeOrganizations(userId())
      })
    }
  }))
}
