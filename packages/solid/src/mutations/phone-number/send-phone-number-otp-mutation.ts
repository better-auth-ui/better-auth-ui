import {
  type PhoneNumberAuthClient,
  type SendPhoneNumberOtpOptions,
  sendPhoneNumberOtpOptions
} from "@better-auth-ui/core/plugins/phone-number"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseSendPhoneNumberOtpOptions<
  TAuthClient extends PhoneNumberAuthClient
> = Accessor<SendPhoneNumberOtpOptions<TAuthClient>>

/** Create a mutation for sending a phone verification code. */
export function useSendPhoneNumberOtp<
  TAuthClient extends PhoneNumberAuthClient
>(
  authClient: TAuthClient,
  options?: UseSendPhoneNumberOtpOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...sendPhoneNumberOtpOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
