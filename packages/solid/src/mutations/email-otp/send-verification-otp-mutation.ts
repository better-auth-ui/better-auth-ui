import {
  type EmailOtpAuthClient,
  type SendVerificationOtpOptions,
  sendVerificationOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseSendVerificationOtpOptions<
  TAuthClient extends EmailOtpAuthClient
> = Accessor<SendVerificationOtpOptions<TAuthClient>>

export function useSendVerificationOtp<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient,
  options?: UseSendVerificationOtpOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...sendVerificationOtpOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
