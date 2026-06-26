import { authQueryKeys } from "@better-auth-ui/core"
import type { UsernameAuthClient } from "@better-auth-ui/core/plugins/username"
import { usernameMutationKeys } from "@better-auth-ui/core/plugins/username"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

export type SignInUsernameParams<TAuthClient extends UsernameAuthClient> =
  Parameters<TAuthClient["signIn"]["username"]>[0]

export type SignInUsernameOptions<TAuthClient extends UsernameAuthClient> =
  Omit<
    ReturnType<typeof signInUsernameOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

/**
 * Mutation options factory for username/password sign-in.
 *
 * @param authClient - The Better Auth client.
 */
export function signInUsernameOptions<TAuthClient extends UsernameAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = usernameMutationKeys.signIn

  const mutationFn = (params: SignInUsernameParams<TAuthClient>) =>
    authClient.signIn.username({
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
 * Create a mutation for username/password sign-in.
 *
 * On success, `MutationInvalidator` awaits invalidation of the session
 * query so the new session is refetched (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the username plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useSignInUsername<TAuthClient extends UsernameAuthClient>(
  authClient: TAuthClient,
  options?: SignInUsernameOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...signInUsernameOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.session]
      }
    },
    queryClient
  )
}
