import {
  type EnableTwoFactorOptions,
  enableTwoFactorOptions,
  type TwoFactorAuthClient
} from "@better-auth-ui/core/plugins/two-factor"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseEnableTwoFactorOptions<TAuthClient extends TwoFactorAuthClient> =
  Accessor<EnableTwoFactorOptions<TAuthClient>>

export function useEnableTwoFactor<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: UseEnableTwoFactorOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...enableTwoFactorOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
