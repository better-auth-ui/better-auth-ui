import { usernameMutationKeys } from "@better-auth-ui/core/plugins/username"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { UsernameAuthClient } from "../../username-auth-client"

export type IsUsernameAvailableParams<TAuthClient extends UsernameAuthClient> =
  Parameters<TAuthClient["isUsernameAvailable"]>[0]

export type IsUsernameAvailableOptions<TAuthClient extends UsernameAuthClient> =
  Omit<
    ReturnType<typeof isUsernameAvailableOptions<TAuthClient>>,
    "mutationKey" | "mutationFn"
  >

/**
 * Mutation options factory for checking username availability.
 *
 * Modeled as a mutation because callers typically trigger the check on
 * user action (debounced input, form submit) rather than on mount.
 *
 * @param authClient - The Better Auth client.
 */
export function isUsernameAvailableOptions<
  TAuthClient extends UsernameAuthClient
>(authClient: TAuthClient) {
  const mutationKey = usernameMutationKeys.isUsernameAvailable

  const mutationFn = (params: IsUsernameAvailableParams<TAuthClient>) =>
    authClient.isUsernameAvailable({
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
 * Create a mutation for checking whether a username is available.
 *
 * Wraps `authClient.isUsernameAvailable` and forwards React Query mutation
 * options such as `onSuccess`, `onError`, and `retry`.
 *
 * @param authClient - The Better Auth client with the username plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useIsUsernameAvailable<TAuthClient extends UsernameAuthClient>(
  authClient: TAuthClient,
  options?: IsUsernameAvailableOptions<TAuthClient>
) {
  return useMutation({
    ...isUsernameAvailableOptions(authClient),
    ...options
  })
}
