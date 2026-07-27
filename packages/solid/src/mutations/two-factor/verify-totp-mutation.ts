import {
  type TwoFactorAuthClient,
  type VerifyTotpOptions,
  verifyTotpOptions
} from "@better-auth-ui/core/plugins/two-factor"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseVerifyTotpOptions<TAuthClient extends TwoFactorAuthClient> =
  Accessor<VerifyTotpOptions<TAuthClient>>

export function useVerifyTotp<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: UseVerifyTotpOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...verifyTotpOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
