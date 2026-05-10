import { authMutationKeys } from "@better-auth-ui/core"
import type { AuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SignInEmailParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["signIn"]["email"]
>[0]

export function signInEmailOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.signIn.email,
    authMutationKeys.signIn.email
  )
}
