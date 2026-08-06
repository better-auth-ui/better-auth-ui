import {
  type EmailOtpAuthClient,
  type RequestPasswordResetOtpOptions,
  requestPasswordResetOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseRequestPasswordResetOtpOptions<
  TAuthClient extends EmailOtpAuthClient
> = Accessor<RequestPasswordResetOtpOptions<TAuthClient>>

export function useRequestPasswordResetOtp<
  TAuthClient extends EmailOtpAuthClient
>(
  authClient: TAuthClient,
  options?: UseRequestPasswordResetOtpOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...requestPasswordResetOtpOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
