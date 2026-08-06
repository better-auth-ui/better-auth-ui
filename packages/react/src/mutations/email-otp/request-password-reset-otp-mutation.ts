import {
  type EmailOtpAuthClient,
  type RequestPasswordResetOtpOptions,
  requestPasswordResetOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useRequestPasswordResetOtp<
  TAuthClient extends EmailOtpAuthClient
>(
  authClient: TAuthClient,
  options?: RequestPasswordResetOtpOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    { ...requestPasswordResetOtpOptions(authClient), ...options },
    queryClient
  )
}
