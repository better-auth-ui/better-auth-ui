import { authMutationKeys } from "@better-auth-ui/core"
import type { AuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type ChangeEmailParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["changeEmail"]
>[0]

export function changeEmailOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.changeEmail,
    authMutationKeys.changeEmail
  )
}
