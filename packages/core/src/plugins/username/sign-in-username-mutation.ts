import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { authQueryKeys } from "../../lib/auth-query-keys"
import type { UsernameAuthClient } from "./username-auth-client"
import { usernameMutationKeys } from "./username-mutation-keys"

export type SignInUsernameFn<TAuthClient extends UsernameAuthClient> =
  TAuthClient["signIn"]["username"]

export type SignInUsernameParams<TAuthClient extends UsernameAuthClient> =
  Parameters<SignInUsernameFn<TAuthClient>>[0]

export type SignInUsernameOptions<TAuthClient extends UsernameAuthClient> =
  Omit<
    ReturnType<typeof signInUsernameOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

/**
 * Mutation options factory for username/password sign-in.
 *
 * @param authClient - The Better Auth username client.
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

  return {
    mutationKey,
    mutationFn,
    meta: {
      awaits: [authQueryKeys.session]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
