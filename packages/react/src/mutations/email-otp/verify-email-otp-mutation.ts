import {
  type EmailOtpAuthClient,
  type VerifyEmailOtpOptions,
  verifyEmailOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useVerifyEmailOtp<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient,
  options?: VerifyEmailOtpOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    { ...verifyEmailOtpOptions(authClient), ...options },
    queryClient
  )
}
