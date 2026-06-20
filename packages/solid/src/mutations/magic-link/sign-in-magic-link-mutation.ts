import { magicLinkMutationKeys } from "@better-auth-ui/core/plugins/magic-link"
import type { MagicLinkAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SignInMagicLinkParams<TAuthClient extends MagicLinkAuthClient> =
  Parameters<TAuthClient["signIn"]["magicLink"]>[0]

export function signInMagicLinkOptions<TAuthClient extends MagicLinkAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.signIn.magicLink,
    magicLinkMutationKeys.signIn
  )
}
