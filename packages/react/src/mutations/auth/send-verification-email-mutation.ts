import {
  type AuthClient,
  type SendVerificationEmailOptions,
  sendVerificationEmailOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/react-query"

export type { SendVerificationEmailParams } from "@better-auth-ui/core"

/**
 * Create a mutation for sending an email-verification link.
 */
export function useSendVerificationEmail<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: SendVerificationEmailOptions<TAuthClient>
) {
  return useMutation({
    ...sendVerificationEmailOptions(authClient),
    ...options
  })
}
