import {
  type PhoneNumberAuthClient,
  type SignInPhoneNumberOptions,
  signInPhoneNumberOptions
} from "@better-auth-ui/core/plugins/phone-number"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseSignInPhoneNumberOptions<
  TAuthClient extends PhoneNumberAuthClient
> = Accessor<SignInPhoneNumberOptions<TAuthClient>>

/** Create a mutation for phone-number and password sign-in. */
export function useSignInPhoneNumber<TAuthClient extends PhoneNumberAuthClient>(
  authClient: TAuthClient,
  options?: UseSignInPhoneNumberOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...signInPhoneNumberOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
