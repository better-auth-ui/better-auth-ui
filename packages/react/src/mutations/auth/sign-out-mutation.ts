import { authMutationKeys, authQueryKeys } from "@better-auth-ui/core"
import {
  mutationOptions,
  type QueryClient,
  useMutation,
  useQueryClient
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/client"

import type { AuthClient } from "../../lib/auth-client"

export type SignOutParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["signOut"]
>[0]

export type SignOutOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof signOutOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for signing out.
 *
 * @param authClient - The Better Auth client.
 */
export function signOutOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = authMutationKeys.signOut

  // biome-ignore lint/suspicious/noConfusingVoidType: void allows no-arg mutate
  const mutationFn = (params?: SignOutParams<TAuthClient> | void) =>
    authClient.signOut({
      ...(params ?? {}),
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
 * Create a mutation for signing the current user out.
 *
 * On success, removes every cached auth query so no stale data leaks across
 * accounts. Sign-out uses a direct `removeQueries` call (rather than the
 * `meta.awaits` / `meta.invalidates` pattern) because the goal is to drop
 * cache entries entirely, not to refetch them.
 *
 * @param authClient - The Better Auth client.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useSignOut<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: SignOutOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const defaultQueryClient = useQueryClient(queryClient)

  return useMutation(
    {
      ...signOutOptions(authClient),
      ...options,
      onSuccess: async (...args) => {
        defaultQueryClient.removeQueries({ queryKey: authQueryKeys.all })
        await options?.onSuccess?.(...args)
      }
    },
    queryClient
  )
}
