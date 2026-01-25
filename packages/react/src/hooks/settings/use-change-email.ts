import {
  type AuthClient,
  useAuth,
  useAuthMutation,
  useSession
} from "@better-auth-ui/react"
import type { UseAuthMutationOptions } from "../auth/use-auth-mutation"

/**
 * Hook that creates a mutation for changing the current user's email address.
 *
 * The mutation sends an email-change request and shows success or error toasts.
 * On success the callback URL is set to the account settings view.
 *
 * @returns The `useMutation` result.
 */
export function useChangeEmail(
  options?: UseAuthMutationOptions<AuthClient["changeEmail"]>
) {
  const { authClient } = useAuth()
  const { refetch } = useSession()

  return useAuthMutation(authClient.changeEmail, {
    onSettled: () => {
      refetch()
    },
    ...options
  })
}
