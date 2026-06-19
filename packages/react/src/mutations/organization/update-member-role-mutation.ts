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
import { useActiveOrganization } from "../../queries/organization"

export type UpdateMemberRoleParams<TAuthClient extends OrganizationAuthClient> =
  Parameters<TAuthClient["organization"]["updateMemberRole"]>[0]

export type UpdateMemberRoleOptions<
  TAuthClient extends OrganizationAuthClient
> = Omit<
  ReturnType<typeof updateMemberRoleOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export function updateMemberRoleOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient) {
  const mutationKey = organizationMutationKeys.updateMemberRole

  const mutationFn = (params: UpdateMemberRoleParams<TAuthClient>) =>
    authClient.organization.updateMemberRole({
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

export function useUpdateMemberRole<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: UpdateMemberRoleOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { data: activeOrganization } = useActiveOrganization(
    authClient,
    undefined,
    queryClient
  )

  return useMutation(
    {
      ...updateMemberRoleOptions(authClient),
      ...options,
      mutationFn: (params: UpdateMemberRoleParams<TAuthClient>) =>
        authClient.organization.updateMemberRole({
          ...params,
          organizationId: params?.organizationId ?? activeOrganization?.id,
          fetchOptions: { ...params?.fetchOptions, throw: true }
        }),
      meta: {
        awaits: [
          organizationQueryKeys.members.all(userId),
          organizationQueryKeys.fullDetails(userId)
        ],
        invalidates: [organizationQueryKeys.permissions.all(userId)]
      }
    },
    queryClient
  )
}
