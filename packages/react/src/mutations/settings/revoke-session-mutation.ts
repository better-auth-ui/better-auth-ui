import { authMutationKeys, authQueryKeys } from "@better-auth-ui/core"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { useSession } from "../../hooks/queries/use-session"
import type { AuthClient } from "../../lib/auth-client"

export type RevokeSessionParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["revokeSession"]
>[0]

export type RevokeSessionOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof revokeSessionOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for revoking a user session.
 *
 * @param authClient - The Better Auth client.
 */
export function revokeSessionOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = authMutationKeys.revokeSession

  const mutationFn = (params: RevokeSessionParams<TAuthClient>) =>
    authClient.revokeSession({
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
 * Create a mutation for revoking a user session.
 *
 * On success, `MutationInvalidator` awaits invalidation of the sessions
 * list (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useRevokeSession<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: RevokeSessionOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...revokeSessionOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.listSessions(userId)]
      }
    },
    queryClient
  )
}
