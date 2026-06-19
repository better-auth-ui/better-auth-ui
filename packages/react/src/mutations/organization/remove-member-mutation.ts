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

export type RemoveMemberParams<TAuthClient extends OrganizationAuthClient> =
  Parameters<TAuthClient["organization"]["removeMember"]>[0]

export type RemoveMemberOptions<TAuthClient extends OrganizationAuthClient> =
  Omit<
    ReturnType<typeof removeMemberOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

export function removeMemberOptions<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = organizationMutationKeys.removeMember

  const mutationFn = (params: RemoveMemberParams<TAuthClient>) =>
    authClient.organization.removeMember({
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

export function useRemoveMember<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: RemoveMemberOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...removeMemberOptions(authClient),
      ...options,
      meta: {
        awaits: [
          organizationQueryKeys.members.all(userId),
          organizationQueryKeys.fullDetails(userId)
        ],
        invalidates: [organizationQueryKeys.lists(userId)]
      }
    },
    queryClient
  )
}
