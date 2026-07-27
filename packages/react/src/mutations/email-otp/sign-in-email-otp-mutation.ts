import {
  type EmailOtpAuthClient,
  type SignInEmailOtpOptions,
  signInEmailOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useSignInEmailOtp<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient,
  options?: SignInEmailOtpOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    { ...signInEmailOtpOptions(authClient), ...options },
    queryClient
  )
}
