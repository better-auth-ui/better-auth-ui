import {
  type TwoFactorAuthClient,
  type VerifyBackupCodeOptions,
  verifyBackupCodeOptions
} from "@better-auth-ui/core/plugins/two-factor"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useVerifyBackupCode<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: VerifyBackupCodeOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    { ...verifyBackupCodeOptions(authClient), ...options },
    queryClient
  )
}
