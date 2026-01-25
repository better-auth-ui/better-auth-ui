import { useAuth, useSession } from "@better-auth-ui/react"
import { useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

/**
 * Hook that creates a mutation for changing the current user's email address.
 *
 * The mutation sends an email-change request and shows success or error toasts.
 * On success the callback URL is set to the account settings view.
 *
 * @returns The `useMutation` result.
 */
export function useChangeEmail() {
  const { authClient, baseURL, viewPaths } = useAuth()
  const { refetch } = useSession()

  return useMutation<
    { status: boolean },
    BetterFetchError,
    { newEmail: string }
  >({
    mutationFn: ({ newEmail }) =>
      authClient.changeEmail({
        newEmail,
        callbackURL: `${baseURL}/${viewPaths.settings.account}`,
        fetchOptions: { throw: true }
      }),
    onSettled: () => {
      refetch()
    }
  })
}
