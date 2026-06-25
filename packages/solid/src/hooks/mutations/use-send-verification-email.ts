import {
  type AuthClient,
  type SendVerificationEmailOptions,
  sendVerificationEmailOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"

export function useSendVerificationEmail<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: SendVerificationEmailOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...sendVerificationEmailOptions(authClient),
    ...options
  }))
}
