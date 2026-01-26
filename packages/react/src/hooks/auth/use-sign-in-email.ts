import {
  type AuthClient,
  useAuth,
  useAuthMutation,
  useSession
} from "@better-auth-ui/react"
import type { UseAuthMutationOptions } from "./use-auth-mutation"

export { useAuthMutation } from "./use-auth-mutation"

/**
 * Hook that creates a mutation for email/password sign-in.
 *
 * The mutation sends an email/password sign-in request and
 * refetches the session on completion.
 *
 * @returns The `useMutation` result.
 */
export function useSignInEmail(
  options?: UseAuthMutationOptions<AuthClient["signIn"]["email"]>
) {
  const { authClient } = useAuth()
  const { refetch } = useSession()

  return useAuthMutation(authClient.signIn.email, {
    onSuccess: async (...args) => {
      await refetch()
      await options?.onSuccess?.(...args)
    },
    ...options
  })
}
