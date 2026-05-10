import { authMutationKeys } from "@better-auth-ui/core"
import type { AuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type RevokeSessionParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["revokeSession"]
>[0]

export function revokeSessionOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.revokeSession,
    authMutationKeys.revokeSession
  )
}
