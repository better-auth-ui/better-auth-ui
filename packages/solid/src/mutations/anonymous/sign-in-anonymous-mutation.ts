import { authQueryKeys } from "@better-auth-ui/core"
import { anonymousMutationKeys } from "@better-auth-ui/core/plugins"
import type { AnonymousAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SignInAnonymousParams<TAuthClient extends AnonymousAuthClient> =
  Parameters<TAuthClient["signIn"]["anonymous"]>[0]

/** Build mutation options for signing in with an anonymous guest account. */
export function signInAnonymousOptions<TAuthClient extends AnonymousAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.signIn.anonymous,
    anonymousMutationKeys.signIn,
    { awaits: [authQueryKeys.session] }
  )
}
