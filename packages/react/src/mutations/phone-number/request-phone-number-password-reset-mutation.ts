import {
  type PhoneNumberAuthClient,
  type RequestPhoneNumberPasswordResetOptions,
  requestPhoneNumberPasswordResetOptions
} from "@better-auth-ui/core/plugins/phone-number"
import { useMutation } from "@tanstack/react-query"

/** Create a mutation for sending a phone password-reset code. */
export function useRequestPhoneNumberPasswordReset<
  TAuthClient extends PhoneNumberAuthClient
>(
  authClient: TAuthClient,
  options?: RequestPhoneNumberPasswordResetOptions<TAuthClient>
) {
  return useMutation({
    ...requestPhoneNumberPasswordResetOptions(authClient),
    ...options
  })
}
