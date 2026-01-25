import { type AuthClient, useAuth, useSession } from "@better-auth-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

/**
 * Hook that creates a mutation for updating the authenticated user's profile.
 *
 * The mutation submits the name update, refetches the session on success,
 * and displays success or error toasts.
 *
 * @returns The `useMutation` result.
 */
export function useUpdateUser() {
  const { authClient } = useAuth()
  const { data: sessionData, refetch } = useSession()
  const queryClient = useQueryClient()

  return useMutation<
    { status: boolean },
    BetterFetchError,
    Partial<AuthClient["$Infer"]["Session"]["user"]>
  >({
    mutationFn: async (fields) => {
      const result = await authClient.updateUser({
        ...fields,
        fetchOptions: { throw: true }
      })

      queryClient.setQueryData(["auth", "getSession"], {
        ...sessionData,
        user: { ...sessionData?.user, ...fields }
      })

      return result
    },
    onSettled: () => {
      refetch()
    }
  })
}
