import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient } from "../lib/auth-client"
import { authMutationKeys } from "../lib/auth-mutation-keys"

export type SignInSocialParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["signIn"]["social"]
>[0]

export type SignInSocialOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof signInSocialOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for social sign-in.
 *
 * @param authClient - The Better Auth client.
 */
export function signInSocialOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = authMutationKeys.signIn.social

  const mutationFn = (params: SignInSocialParams<TAuthClient>) =>
    authClient.signIn.social({
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
