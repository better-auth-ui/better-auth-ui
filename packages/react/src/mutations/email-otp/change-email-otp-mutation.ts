import {
  type ChangeEmailOtpOptions,
  changeEmailOtpOptions,
  type EmailOtpAuthClient
} from "@better-auth-ui/core/plugins/email-otp"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useChangeEmailOtp<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient,
  options?: ChangeEmailOtpOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    { ...changeEmailOtpOptions(authClient), ...options },
    queryClient
  )
}
