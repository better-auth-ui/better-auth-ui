import {
  type DisableTwoFactorOptions,
  disableTwoFactorOptions,
  type TwoFactorAuthClient
} from "@better-auth-ui/core/plugins/two-factor"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseDisableTwoFactorOptions<
  TAuthClient extends TwoFactorAuthClient
> = Accessor<DisableTwoFactorOptions<TAuthClient>>

export function useDisableTwoFactor<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: UseDisableTwoFactorOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...disableTwoFactorOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
