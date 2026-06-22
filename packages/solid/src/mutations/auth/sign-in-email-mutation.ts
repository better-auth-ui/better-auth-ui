import {
  type AuthClient,
  type SignInEmailOptions,
  signInEmailOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"

export type { SignInEmailParams } from "@better-auth-ui/core"

export function useSignInEmail<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: SignInEmailOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...signInEmailOptions(authClient),
    ...options
  }))
}
export const signInEmailMutation = useSignInEmail
