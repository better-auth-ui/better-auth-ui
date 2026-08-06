import {
  type TwoFactorAuthClient,
  type VerifyBackupCodeOptions,
  verifyBackupCodeOptions
} from "@better-auth-ui/core/plugins/two-factor"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseVerifyBackupCodeOptions<
  TAuthClient extends TwoFactorAuthClient
> = Accessor<VerifyBackupCodeOptions<TAuthClient>>

export function useVerifyBackupCode<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: UseVerifyBackupCodeOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...verifyBackupCodeOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
