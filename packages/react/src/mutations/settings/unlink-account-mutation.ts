import { authMutationKeys, authQueryKeys } from "@better-auth-ui/core"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { useSession } from "../../hooks/queries/use-session"
import type { AuthClient } from "../../lib/auth-client"

export type UnlinkAccountParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["unlinkAccount"]
>[0]

export type UnlinkAccountOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof unlinkAccountOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for unlinking a social provider from the current user.
 *
 * @param authClient - The Better Auth client.
 */
export function unlinkAccountOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = authMutationKeys.unlinkAccount

  const mutationFn = (params: UnlinkAccountParams<TAuthClient>) =>
    authClient.unlinkAccount({
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
 * Create a mutation for unlinking a social provider from the current user.
 *
 * On success, `MutationInvalidator` awaits invalidation of the linked
 * accounts list (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useUnlinkAccount<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UnlinkAccountOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...unlinkAccountOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.listAccounts(userId)]
      }
    },
    queryClient
  )
}
