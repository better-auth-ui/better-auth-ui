import {
  type AuthClient,
  type SendVerificationEmailOptions,
  sendVerificationEmailOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"

export type { SendVerificationEmailParams } from "@better-auth-ui/core"

export function useSendVerificationEmail<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: SendVerificationEmailOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...sendVerificationEmailOptions(authClient),
    ...options
  }))
}
export const sendVerificationEmailMutation = useSendVerificationEmail
