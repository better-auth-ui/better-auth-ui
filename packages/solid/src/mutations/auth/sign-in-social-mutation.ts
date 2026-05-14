import { authMutationKeys } from "@better-auth-ui/core"
import type { AuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SignInSocialParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["signIn"]["social"]
>[0]

export function signInSocialOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.signIn.social,
    authMutationKeys.signIn.social
  )
}
