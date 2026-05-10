import { authMutationKeys } from "@better-auth-ui/core"
import type { AuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SignUpEmailParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["signUp"]["email"]
>[0]

export function signUpEmailOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.signUp.email,
    authMutationKeys.signUp.email
  )
}
