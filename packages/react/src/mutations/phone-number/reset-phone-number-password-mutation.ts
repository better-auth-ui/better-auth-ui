import {
  type PhoneNumberAuthClient,
  type ResetPhoneNumberPasswordOptions,
  resetPhoneNumberPasswordOptions
} from "@better-auth-ui/core/plugins/phone-number"
import { useMutation } from "@tanstack/react-query"

/** Create a mutation for resetting a password with a phone code. */
export function useResetPhoneNumberPassword<
  TAuthClient extends PhoneNumberAuthClient
>(
  authClient: TAuthClient,
  options?: ResetPhoneNumberPasswordOptions<TAuthClient>
) {
  return useMutation({
    ...resetPhoneNumberPasswordOptions(authClient),
    ...options
  })
}
