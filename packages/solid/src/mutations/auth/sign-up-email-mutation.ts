import {
  type AuthClient,
  type SignUpEmailOptions,
  signUpEmailOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"

export type { SignUpEmailParams } from "@better-auth-ui/core"

export function useSignUpEmail<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: SignUpEmailOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...signUpEmailOptions(authClient),
    ...options
  }))
}
export const signUpEmailMutation = useSignUpEmail
