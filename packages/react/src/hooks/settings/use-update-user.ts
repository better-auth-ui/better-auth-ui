import {
  type AuthClient,
  useAuth,
  useAuthMutation,
  useSession
} from "@better-auth-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import type {
  UseAuthMutationOptions,
  UseAuthMutationResult
} from "../auth/use-auth-mutation"

/**
 * Hook that creates a mutation for updating the authenticated user's profile.
 *
 * The mutation submits the name update, refetches the session on success,
 * and displays success or error toasts.
 *
 * @returns The `useMutation` result.
 */
export function useUpdateUser(
  options?: UseAuthMutationOptions<AuthClient["updateUser"]>
): UseAuthMutationResult<AuthClient["updateUser"]> {
  const { authClient } = useAuth()
  const { data: sessionData, refetch } = useSession()
  const queryClient = useQueryClient()

  return useAuthMutation(authClient.updateUser, {
    ...options,
    onSuccess: async (data, variables, ...rest) => {
      queryClient.setQueryData(["auth", "getSession"], {
        ...sessionData,
        user: { ...sessionData?.user, ...variables }
      })

      refetch()

      await options?.onSuccess?.(data, variables, ...rest)
    }
  })
}
