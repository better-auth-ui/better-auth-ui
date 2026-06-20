import { authQueryKeys } from "@better-auth-ui/core"
import { usernameMutationKeys } from "@better-auth-ui/core/plugins/username"
import type { UsernameAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SignInUsernameParams<TAuthClient extends UsernameAuthClient> =
  Parameters<TAuthClient["signIn"]["username"]>[0]

export function signInUsernameOptions<TAuthClient extends UsernameAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.signIn.username,
    usernameMutationKeys.signIn,
    { awaits: [authQueryKeys.session] }
  )
}
