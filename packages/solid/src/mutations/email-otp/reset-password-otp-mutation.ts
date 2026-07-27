import {
  type EmailOtpAuthClient,
  type ResetPasswordOtpOptions,
  resetPasswordOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseResetPasswordOtpOptions<TAuthClient extends EmailOtpAuthClient> =
  Accessor<ResetPasswordOtpOptions<TAuthClient>>

export function useResetPasswordOtp<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient,
  options?: UseResetPasswordOtpOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...resetPasswordOtpOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
