import {
  type AuthClient,
  useAuth,
  useAuthMutation,
  useSession
} from "@better-auth-ui/react"
import type { UseAuthMutationOptions } from "./use-auth-mutation"

export { useAuthMutation } from "./use-auth-mutation"

/**
 * Hook that creates a mutation for email/password sign-up.
 *
 * The mutation sends an email/password sign-up request and
 * refetches the session on success.
 *
 * @returns The `useMutation` result.
 */
export function useSignUpEmail(
  options?: UseAuthMutationOptions<AuthClient["signUp"]["email"]>
) {
  const { authClient } = useAuth()
  const { refetch } = useSession()

  return useAuthMutation({
    authFn: authClient.signUp.email,
    options: {
      ...options,
      onSuccess: async (...args) => {
        await refetch()
        await options?.onSuccess?.(...args)
      }
    }
  })
}
