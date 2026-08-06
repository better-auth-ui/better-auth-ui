import {
  type EmailOtpAuthClient,
  type RequestEmailChangeOtpOptions,
  requestEmailChangeOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseRequestEmailChangeOtpOptions<
  TAuthClient extends EmailOtpAuthClient
> = Accessor<RequestEmailChangeOtpOptions<TAuthClient>>

export function useRequestEmailChangeOtp<
  TAuthClient extends EmailOtpAuthClient
>(
  authClient: TAuthClient,
  options?: UseRequestEmailChangeOtpOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...requestEmailChangeOtpOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
