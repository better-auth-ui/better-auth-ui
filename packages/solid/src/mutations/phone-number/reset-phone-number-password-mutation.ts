import {
  type PhoneNumberAuthClient,
  type ResetPhoneNumberPasswordOptions,
  resetPhoneNumberPasswordOptions
} from "@better-auth-ui/core/plugins/phone-number"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseResetPhoneNumberPasswordOptions<
  TAuthClient extends PhoneNumberAuthClient
> = Accessor<ResetPhoneNumberPasswordOptions<TAuthClient>>

/** Create a mutation for resetting a password with a phone code. */
export function useResetPhoneNumberPassword<
  TAuthClient extends PhoneNumberAuthClient
>(
  authClient: TAuthClient,
  options?: UseResetPhoneNumberPasswordOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...resetPhoneNumberPasswordOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
