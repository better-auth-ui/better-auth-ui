import {
  type PhoneNumberAuthClient,
  type SendPhoneNumberOtpOptions,
  sendPhoneNumberOtpOptions
} from "@better-auth-ui/core/plugins/phone-number"
import { useMutation } from "@tanstack/react-query"

/** Create a mutation for sending a phone verification code. */
export function useSendPhoneNumberOtp<
  TAuthClient extends PhoneNumberAuthClient
>(authClient: TAuthClient, options?: SendPhoneNumberOtpOptions<TAuthClient>) {
  return useMutation({
    ...sendPhoneNumberOtpOptions(authClient),
    ...options
  })
}
