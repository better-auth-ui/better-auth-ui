import { authQueryKeys } from "@better-auth-ui/core"
import { passkeyMutationKeys } from "@better-auth-ui/core/plugins/passkey"
import { useMutation } from "@tanstack/solid-query"
import type { PasskeyAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SignInPasskeyParams<TAuthClient extends PasskeyAuthClient> =
  Parameters<TAuthClient["signIn"]["passkey"]>[0]

export type SignInPasskeyOptions = Omit<
  ReturnType<typeof signInPasskeyOptions<PasskeyAuthClient>>,
  "mutationKey" | "mutationFn"
>

export function signInPasskeyOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.signIn.passkey,
    passkeyMutationKeys.signIn,
    { awaits: [authQueryKeys.session] }
  )
}

export function useSignInPasskey<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: SignInPasskeyOptions
) {
  return useMutation(() => ({
    ...signInPasskeyOptions(authClient),
    ...options
  }))
}
