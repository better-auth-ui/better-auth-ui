import {
  passkeyMutationKeys,
  passkeyQueryKeys
} from "@better-auth-ui/core/plugins/passkey"
import type { PasskeyAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"
import { useSessionScopedMutation } from "../use-session-scoped-mutation"

export type AddPasskeyParams<TAuthClient extends PasskeyAuthClient> =
  Parameters<TAuthClient["passkey"]["addPasskey"]>[0]

export type AddPasskeyOptions = Parameters<
  typeof useSessionScopedMutation<
    PasskeyAuthClient,
    PasskeyAuthClient["passkey"]["addPasskey"],
    typeof passkeyMutationKeys.addPasskey
  >
>[4]

export function addPasskeyOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.passkey.addPasskey,
    passkeyMutationKeys.addPasskey
  )
}

export function useAddPasskey<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: AddPasskeyOptions
) {
  return useSessionScopedMutation(
    authClient,
    authClient.passkey.addPasskey,
    passkeyMutationKeys.addPasskey,
    (userId) => ({ awaits: [passkeyQueryKeys.lists(userId)] }),
    options
  )
}
