import { authMutationKeys } from "@better-auth-ui/core"
import type { AuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type UnlinkAccountParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["unlinkAccount"]
>[0]

export function unlinkAccountOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.unlinkAccount,
    authMutationKeys.unlinkAccount
  )
}
