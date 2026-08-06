import {
  type TwoFactorAuthClient,
  type VerifyTwoFactorOtpOptions,
  verifyTwoFactorOtpOptions
} from "@better-auth-ui/core/plugins/two-factor"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useVerifyTwoFactorOtp<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: VerifyTwoFactorOtpOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    { ...verifyTwoFactorOtpOptions(authClient), ...options },
    queryClient
  )
}
