import { passkeyMutationKeys } from "@better-auth-ui/core/plugins"
import type { PasskeyAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type DeletePasskeyParams<TAuthClient extends PasskeyAuthClient> =
  Parameters<TAuthClient["passkey"]["deletePasskey"]>[0]

export function deletePasskeyOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.passkey.deletePasskey,
    passkeyMutationKeys.deletePasskey
  )
}
