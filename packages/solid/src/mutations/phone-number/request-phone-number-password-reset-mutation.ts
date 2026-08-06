import {
  type PhoneNumberAuthClient,
  type RequestPhoneNumberPasswordResetOptions,
  requestPhoneNumberPasswordResetOptions
} from "@better-auth-ui/core/plugins/phone-number"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseRequestPhoneNumberPasswordResetOptions<
  TAuthClient extends PhoneNumberAuthClient
> = Accessor<RequestPhoneNumberPasswordResetOptions<TAuthClient>>

/** Create a mutation for sending a phone password-reset code. */
export function useRequestPhoneNumberPasswordReset<
  TAuthClient extends PhoneNumberAuthClient
>(
  authClient: TAuthClient,
  options?: UseRequestPhoneNumberPasswordResetOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...requestPhoneNumberPasswordResetOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
