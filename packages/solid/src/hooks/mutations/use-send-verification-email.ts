import {
  type AuthClient,
  type SendVerificationEmailOptions,
  sendVerificationEmailOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseSendVerificationEmailOptions<TAuthClient extends AuthClient> =
  Accessor<SendVerificationEmailOptions<TAuthClient>>

export function useSendVerificationEmail<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseSendVerificationEmailOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...sendVerificationEmailOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
