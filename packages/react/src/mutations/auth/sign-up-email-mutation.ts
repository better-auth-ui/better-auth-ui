import {
  type AuthClient,
  type SignUpEmailOptions,
  signUpEmailOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export type { SignUpEmailParams } from "@better-auth-ui/core"

/**
 * Create a mutation for email/password sign-up.
 */
export function useSignUpEmail<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: SignUpEmailOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...signUpEmailOptions(authClient),
      ...options
    },
    queryClient
  )
}
