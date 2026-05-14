import { authMutationKeys } from "@better-auth-ui/core"
import type { AuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SignOutParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["signOut"]
>[0]

export function signOutOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(authClient.signOut, authMutationKeys.signOut)
}
