import {
  passkeyMutationKeys,
  passkeyQueryKeys
} from "@better-auth-ui/core/plugins/passkey"
import type { PasskeyAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"
import { useSessionScopedMutation } from "../use-session-scoped-mutation"

export type DeletePasskeyParams<TAuthClient extends PasskeyAuthClient> =
  Parameters<TAuthClient["passkey"]["deletePasskey"]>[0]

export type DeletePasskeyOptions = Parameters<
  typeof useSessionScopedMutation<
    PasskeyAuthClient,
    PasskeyAuthClient["passkey"]["deletePasskey"],
    typeof passkeyMutationKeys.deletePasskey
  >
>[4]

export function deletePasskeyOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.passkey.deletePasskey,
    passkeyMutationKeys.deletePasskey
  )
}

export function useDeletePasskey<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: DeletePasskeyOptions
) {
  return useSessionScopedMutation(
    authClient,
    authClient.passkey.deletePasskey,
    passkeyMutationKeys.deletePasskey,
    (userId) => ({ awaits: [passkeyQueryKeys.lists(userId)] }),
    options
  )
}
