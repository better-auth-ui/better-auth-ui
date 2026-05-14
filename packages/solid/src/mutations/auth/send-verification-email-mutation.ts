import { authMutationKeys } from "@better-auth-ui/core"
import type { AuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SendVerificationEmailParams<TAuthClient extends AuthClient> =
  Parameters<TAuthClient["sendVerificationEmail"]>[0]

export function sendVerificationEmailOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.sendVerificationEmail,
    authMutationKeys.sendVerificationEmail
  )
}
