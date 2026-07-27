import {
  type EnableTwoFactorOptions,
  enableTwoFactorOptions,
  type TwoFactorAuthClient
} from "@better-auth-ui/core/plugins/two-factor"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useEnableTwoFactor<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: EnableTwoFactorOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    { ...enableTwoFactorOptions(authClient), ...options },
    queryClient
  )
}
