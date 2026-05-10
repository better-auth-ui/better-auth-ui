import { authMutationKeys } from "@better-auth-ui/core"
import type { MultiSessionAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type RevokeMultiSessionParams<
  TAuthClient extends MultiSessionAuthClient
> = Parameters<TAuthClient["multiSession"]["revoke"]>[0]

export function revokeMultiSessionOptions<
  TAuthClient extends MultiSessionAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.multiSession.revoke,
    authMutationKeys.multiSession.revoke
  )
}
