import {
  type ChangeEmailOtpOptions,
  changeEmailOtpOptions,
  type EmailOtpAuthClient
} from "@better-auth-ui/core/plugins/email-otp"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseChangeEmailOtpOptions<TAuthClient extends EmailOtpAuthClient> =
  Accessor<ChangeEmailOtpOptions<TAuthClient>>

export function useChangeEmailOtp<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient,
  options?: UseChangeEmailOtpOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...changeEmailOtpOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
