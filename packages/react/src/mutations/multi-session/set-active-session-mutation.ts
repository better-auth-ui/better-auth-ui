import { authQueryKeys } from "@better-auth-ui/core"
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

export type SetActiveSessionParams<TAuthClient extends MultiSessionAuthClient> =
  Parameters<TAuthClient["multiSession"]["setActive"]>[0]

export type SetActiveSessionOptions<
  TAuthClient extends MultiSessionAuthClient
> = Omit<
  ReturnType<typeof setActiveSessionOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for switching the active device session.
 *
 * @param authClient - The Better Auth client with the multi-session plugin.
 */
export function setActiveSessionOptions<
  TAuthClient extends MultiSessionAuthClient
>(authClient: TAuthClient) {
  const mutationKey = multiSessionMutationKeys.setActive

  const mutationFn = (params: SetActiveSessionParams<TAuthClient>) =>
    authClient.multiSession.setActive({
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
 * Create a mutation for switching the active device session.
 *
 * On success, `MutationInvalidator` awaits invalidation of the session
 * and device sessions queries (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the multi-session plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useSetActiveSession<TAuthClient extends MultiSessionAuthClient>(
  authClient: TAuthClient,
  options?: SetActiveSessionOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...setActiveSessionOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.session, multiSessionQueryKeys.lists(userId)]
      }
    },
    queryClient
  )
}
