import {
  type EmailOtpAuthClient,
  type VerifyEmailOtpOptions,
  verifyEmailOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseVerifyEmailOtpOptions<TAuthClient extends EmailOtpAuthClient> =
  Accessor<VerifyEmailOtpOptions<TAuthClient>>

export function useVerifyEmailOtp<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient,
  options?: UseVerifyEmailOtpOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...verifyEmailOtpOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
