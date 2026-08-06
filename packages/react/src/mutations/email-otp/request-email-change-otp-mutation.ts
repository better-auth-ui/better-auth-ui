import {
  type EmailOtpAuthClient,
  type RequestEmailChangeOtpOptions,
  requestEmailChangeOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useRequestEmailChangeOtp<
  TAuthClient extends EmailOtpAuthClient
>(
  authClient: TAuthClient,
  options?: RequestEmailChangeOtpOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    { ...requestEmailChangeOtpOptions(authClient), ...options },
    queryClient
  )
}
