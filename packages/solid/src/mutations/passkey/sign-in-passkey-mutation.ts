import { passkeyMutationKeys } from "@better-auth-ui/core/plugins"
import type { PasskeyAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SignInPasskeyParams<TAuthClient extends PasskeyAuthClient> =
  Parameters<TAuthClient["signIn"]["passkey"]>[0]

export function signInPasskeyOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.signIn.passkey,
    passkeyMutationKeys.signIn
  )
}
