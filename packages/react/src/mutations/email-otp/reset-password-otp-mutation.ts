import {
  type EmailOtpAuthClient,
  type ResetPasswordOtpOptions,
  resetPasswordOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useResetPasswordOtp<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient,
  options?: ResetPasswordOtpOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    { ...resetPasswordOtpOptions(authClient), ...options },
    queryClient
  )
}
