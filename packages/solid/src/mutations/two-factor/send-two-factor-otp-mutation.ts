import {
  type SendTwoFactorOtpOptions,
  sendTwoFactorOtpOptions,
  type TwoFactorAuthClient
} from "@better-auth-ui/core/plugins/two-factor"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseSendTwoFactorOtpOptions<
  TAuthClient extends TwoFactorAuthClient
> = Accessor<SendTwoFactorOtpOptions<TAuthClient>>

export function useSendTwoFactorOtp<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: UseSendTwoFactorOtpOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...sendTwoFactorOtpOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
