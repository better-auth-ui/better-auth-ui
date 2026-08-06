import {
  type PasskeyAuthClient,
  type SignInPasskeyOptions,
  signInPasskeyOptions
} from "@better-auth-ui/core/plugins/passkey"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseSignInPasskeyOptions<TAuthClient extends PasskeyAuthClient> =
  Accessor<SignInPasskeyOptions<TAuthClient>>

export function useSignInPasskey<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: UseSignInPasskeyOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...signInPasskeyOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
