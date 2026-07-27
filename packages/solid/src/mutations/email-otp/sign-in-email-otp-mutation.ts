import {
  type EmailOtpAuthClient,
  type SignInEmailOtpOptions,
  signInEmailOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseSignInEmailOtpOptions<TAuthClient extends EmailOtpAuthClient> =
  Accessor<SignInEmailOtpOptions<TAuthClient>>

export function useSignInEmailOtp<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient,
  options?: UseSignInEmailOtpOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...signInEmailOtpOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
