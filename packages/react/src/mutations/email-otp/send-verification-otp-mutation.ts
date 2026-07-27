import {
  type EmailOtpAuthClient,
  type SendVerificationOtpOptions,
  sendVerificationOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useSendVerificationOtp<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient,
  options?: SendVerificationOtpOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    { ...sendVerificationOtpOptions(authClient), ...options },
    queryClient
  )
}
