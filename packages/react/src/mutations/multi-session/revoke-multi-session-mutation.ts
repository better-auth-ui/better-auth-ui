import {
  multiSessionMutationKeys,
  multiSessionQueryKeys
} from "@better-auth-ui/core/plugins"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { useSession } from "../../hooks/queries/use-session"
import type { MultiSessionAuthClient } from "../../lib/auth-client"

export type RevokeMultiSessionParams<
  TAuthClient extends MultiSessionAuthClient
> = Parameters<TAuthClient["multiSession"]["revoke"]>[0]

export type RevokeMultiSessionOptions<
  TAuthClient extends MultiSessionAuthClient
> = Omit<
  ReturnType<typeof revokeMultiSessionOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for revoking a device session in multi-session mode.
 *
 * @param authClient - The Better Auth client with the multi-session plugin.
 */
export function revokeMultiSessionOptions<
  TAuthClient extends MultiSessionAuthClient
>(authClient: TAuthClient) {
  const mutationKey = multiSessionMutationKeys.revoke

  const mutationFn = (params: RevokeMultiSessionParams<TAuthClient>) =>
    authClient.multiSession.revoke({
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

/**
 * Create a mutation for revoking a device session in multi-session mode.
 *
 * On success, `MutationInvalidator` awaits invalidation of the device
 * sessions list (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the multi-session plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useRevokeMultiSession<
  TAuthClient extends MultiSessionAuthClient
>(
  authClient: TAuthClient,
  options?: RevokeMultiSessionOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...revokeMultiSessionOptions(authClient),
      ...options,
      meta: {
        awaits: [multiSessionQueryKeys.lists(userId)]
      }
    },
    queryClient
  )
}
