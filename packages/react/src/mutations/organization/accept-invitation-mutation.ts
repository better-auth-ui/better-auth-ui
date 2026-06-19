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

export type AcceptInvitationParams<TAuthClient extends OrganizationAuthClient> =
  Parameters<TAuthClient["organization"]["acceptInvitation"]>[0]

export type AcceptInvitationOptions<
  TAuthClient extends OrganizationAuthClient
> = Omit<
  ReturnType<typeof acceptInvitationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export function acceptInvitationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient) {
  const mutationKey = organizationMutationKeys.acceptInvitation

  const mutationFn = (params: AcceptInvitationParams<TAuthClient>) =>
    authClient.organization.acceptInvitation({
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

export function useAcceptInvitation<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: AcceptInvitationOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...acceptInvitationOptions(authClient),
      ...options,
      meta: {
        awaits: [
          organizationQueryKeys.userInvitations.all(userId),
          organizationQueryKeys.lists(userId)
        ],
        invalidates: [
          organizationQueryKeys.fullDetails(userId),
          organizationQueryKeys.activeOrganizations(userId)
        ]
      }
    },
    queryClient
  )
}
