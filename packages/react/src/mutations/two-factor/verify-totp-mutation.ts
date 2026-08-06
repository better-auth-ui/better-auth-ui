import {
  type TwoFactorAuthClient,
  type VerifyTotpOptions,
  verifyTotpOptions
} from "@better-auth-ui/core/plugins/two-factor"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useVerifyTotp<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: VerifyTotpOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    { ...verifyTotpOptions(authClient), ...options },
    queryClient
  )
}
