import {
  type DisableTwoFactorOptions,
  disableTwoFactorOptions,
  type TwoFactorAuthClient
} from "@better-auth-ui/core/plugins/two-factor"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useDisableTwoFactor<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: DisableTwoFactorOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    { ...disableTwoFactorOptions(authClient), ...options },
    queryClient
  )
}
