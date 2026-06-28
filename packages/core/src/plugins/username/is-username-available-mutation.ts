import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { UsernameAuthClient } from "./username-auth-client"
import { usernameMutationKeys } from "./username-mutation-keys"

export type IsUsernameAvailableFn<TAuthClient extends UsernameAuthClient> =
  TAuthClient["isUsernameAvailable"]

export type IsUsernameAvailableParams<TAuthClient extends UsernameAuthClient> =
  Parameters<IsUsernameAvailableFn<TAuthClient>>[0]

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
 * @param authClient - The Better Auth username client.
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

  return {
    mutationKey,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
