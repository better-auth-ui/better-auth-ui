import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { MagicLinkAuthClient } from "./magic-link-auth-client"
import { magicLinkMutationKeys } from "./magic-link-mutation-keys"

export type SignInMagicLinkParams<TAuthClient extends MagicLinkAuthClient> =
  Parameters<TAuthClient["signIn"]["magicLink"]>[0]

export type SignInMagicLinkOptions<TAuthClient extends MagicLinkAuthClient> =
  Omit<
    ReturnType<typeof signInMagicLinkOptions<TAuthClient>>,
    "mutationKey" | "mutationFn"
  >

/**
 * Mutation options factory for signing in with a magic link.
 *
 * @param authClient - The Better Auth magic link client.
 */
export function signInMagicLinkOptions<TAuthClient extends MagicLinkAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = magicLinkMutationKeys.signIn

  const mutationFn = (params: SignInMagicLinkParams<TAuthClient>) =>
    authClient.signIn.magicLink({
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
