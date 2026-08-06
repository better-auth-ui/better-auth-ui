import {
  type GenerateBackupCodesOptions,
  generateBackupCodesOptions,
  type TwoFactorAuthClient
} from "@better-auth-ui/core/plugins/two-factor"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseGenerateBackupCodesOptions<
  TAuthClient extends TwoFactorAuthClient
> = Accessor<GenerateBackupCodesOptions<TAuthClient>>

export function useGenerateBackupCodes<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: UseGenerateBackupCodesOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...generateBackupCodesOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
