import { passkeyMutationKeys } from "@better-auth-ui/core/plugins"
import type { PasskeyAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type AddPasskeyParams<TAuthClient extends PasskeyAuthClient> =
  Parameters<TAuthClient["passkey"]["addPasskey"]>[0]

export function addPasskeyOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.passkey.addPasskey,
    passkeyMutationKeys.addPasskey
  )
}
