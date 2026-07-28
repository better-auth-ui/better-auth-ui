import {
  type PhoneNumberAuthClient,
  type SignInPhoneNumberOptions,
  signInPhoneNumberOptions
} from "@better-auth-ui/core/plugins/phone-number"
import { type QueryClient, useMutation } from "@tanstack/react-query"

/** Create a mutation for phone-number and password sign-in. */
export function useSignInPhoneNumber<TAuthClient extends PhoneNumberAuthClient>(
  authClient: TAuthClient,
  options?: SignInPhoneNumberOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...signInPhoneNumberOptions(authClient),
      ...options
    },
    queryClient
  )
}
