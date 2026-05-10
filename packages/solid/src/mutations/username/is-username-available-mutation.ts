import { authMutationKeys } from "@better-auth-ui/core"
import type { UsernameAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type IsUsernameAvailableParams<TAuthClient extends UsernameAuthClient> =
  Parameters<TAuthClient["isUsernameAvailable"]>[0]

export function isUsernameAvailableOptions<
  TAuthClient extends UsernameAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.isUsernameAvailable,
    authMutationKeys.isUsernameAvailable
  )
}
