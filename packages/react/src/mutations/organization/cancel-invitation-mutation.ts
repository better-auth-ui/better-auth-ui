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

export type CancelInvitationParams<TAuthClient extends OrganizationAuthClient> =
  Parameters<TAuthClient["organization"]["cancelInvitation"]>[0]

export type CancelInvitationOptions<
  TAuthClient extends OrganizationAuthClient
> = Omit<
  ReturnType<typeof cancelInvitationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export function cancelInvitationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient) {
  const mutationKey = organizationMutationKeys.cancelInvitation

  const mutationFn = (params: CancelInvitationParams<TAuthClient>) =>
    authClient.organization.cancelInvitation({
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

export function useCancelInvitation<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: CancelInvitationOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...cancelInvitationOptions(authClient),
      ...options,
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
