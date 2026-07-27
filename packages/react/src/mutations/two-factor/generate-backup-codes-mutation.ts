import {
  type GenerateBackupCodesOptions,
  generateBackupCodesOptions,
  type TwoFactorAuthClient
} from "@better-auth-ui/core/plugins/two-factor"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useGenerateBackupCodes<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: GenerateBackupCodesOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    { ...generateBackupCodesOptions(authClient), ...options },
    queryClient
  )
}
