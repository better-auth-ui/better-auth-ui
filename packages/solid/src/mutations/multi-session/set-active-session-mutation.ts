import { authMutationKeys } from "@better-auth-ui/core"
import type { MultiSessionAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SetActiveSessionParams<TAuthClient extends MultiSessionAuthClient> =
  Parameters<TAuthClient["multiSession"]["setActive"]>[0]

export function setActiveSessionOptions<
  TAuthClient extends MultiSessionAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.multiSession.setActive,
    authMutationKeys.multiSession.setActive
  )
}
