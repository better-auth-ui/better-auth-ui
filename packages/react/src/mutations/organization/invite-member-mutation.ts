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

export type InviteMemberParams<TAuthClient extends OrganizationAuthClient> =
  Parameters<TAuthClient["organization"]["inviteMember"]>[0]

export type InviteMemberOptions<TAuthClient extends OrganizationAuthClient> =
  Omit<
    ReturnType<typeof inviteMemberOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

export function inviteMemberOptions<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = organizationMutationKeys.inviteMember

  const mutationFn = (params: InviteMemberParams<TAuthClient>) =>
    authClient.organization.inviteMember({
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

export function useInviteMember<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: InviteMemberOptions<TAuthClient>,
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
      ...inviteMemberOptions(authClient),
      ...options,
      mutationFn: (params: InviteMemberParams<TAuthClient>) =>
        authClient.organization.inviteMember({
          ...params,
          organizationId: params?.organizationId ?? activeOrganization?.id,
          fetchOptions: { ...params?.fetchOptions, throw: true }
        }),
      meta: {
        awaits: [
          organizationQueryKeys.invitations.all(userId),
          organizationQueryKeys.fullDetails(userId)
        ]
      }
    },
    queryClient
  )
}
