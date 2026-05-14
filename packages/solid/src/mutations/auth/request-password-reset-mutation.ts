import { authMutationKeys } from "@better-auth-ui/core"
import type { AuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type RequestPasswordResetParams<TAuthClient extends AuthClient> =
  Parameters<TAuthClient["requestPasswordReset"]>[0]

export function requestPasswordResetOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.requestPasswordReset,
    authMutationKeys.requestPasswordReset
  )
}
