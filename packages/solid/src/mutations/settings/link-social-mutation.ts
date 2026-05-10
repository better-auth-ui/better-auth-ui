import { authMutationKeys } from "@better-auth-ui/core"
import type { AuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type LinkSocialParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["linkSocial"]
>[0]

export function linkSocialOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.linkSocial,
    authMutationKeys.linkSocial
  )
}
