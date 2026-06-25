import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { authMutationOptions } from "../../lib/auth-mutation-options"
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
  return authMutationOptions(
    authClient.signIn.magicLink,
    magicLinkMutationKeys.signIn
  ) as MutationOptions<
    Awaited<ReturnType<TAuthClient["signIn"]["magicLink"]>>,
    BetterFetchError,
    SignInMagicLinkParams<TAuthClient>
  >
}
