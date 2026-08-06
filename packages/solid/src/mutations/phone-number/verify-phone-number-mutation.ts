import {
  type PhoneNumberAuthClient,
  type VerifyPhoneNumberOptions,
  verifyPhoneNumberOptions
} from "@better-auth-ui/core/plugins/phone-number"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseVerifyPhoneNumberOptions<
  TAuthClient extends PhoneNumberAuthClient
> = Accessor<VerifyPhoneNumberOptions<TAuthClient>>

/**
 * Create a mutation for verifying a phone-number code.
 *
 * Verification can create a session or update the current user's phone
 * number, so the session query is refreshed before success settles.
 */
export function useVerifyPhoneNumber<TAuthClient extends PhoneNumberAuthClient>(
  authClient: TAuthClient,
  options?: UseVerifyPhoneNumberOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...verifyPhoneNumberOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
