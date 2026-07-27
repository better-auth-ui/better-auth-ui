import {
  type SendTwoFactorOtpOptions,
  sendTwoFactorOtpOptions,
  type TwoFactorAuthClient
} from "@better-auth-ui/core/plugins/two-factor"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useSendTwoFactorOtp<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: SendTwoFactorOtpOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    { ...sendTwoFactorOtpOptions(authClient), ...options },
    queryClient
  )
}
