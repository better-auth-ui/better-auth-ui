import {
  type TwoFactorAuthClient,
  type VerifyTwoFactorOtpOptions,
  verifyTwoFactorOtpOptions
} from "@better-auth-ui/core/plugins/two-factor"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseVerifyTwoFactorOtpOptions<
  TAuthClient extends TwoFactorAuthClient
> = Accessor<VerifyTwoFactorOtpOptions<TAuthClient>>

export function useVerifyTwoFactorOtp<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: UseVerifyTwoFactorOtpOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...verifyTwoFactorOtpOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
