import {
  type AuthClient,
  useAuth,
  useAuthMutation,
  useSession
} from "@better-auth-ui/react"
import {
  type UseMutationOptions,
  type UseMutationResult,
  useQueryClient
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

/**
 * Hook that creates a mutation for updating the authenticated user's profile.
 *
 * The mutation submits the name update, refetches the session on success,
 * and displays success or error toasts.
 *
 * @returns The `useMutation` result.
 */
export function useUpdateUser(
  options?: UseMutationOptions<
    { status: boolean },
    BetterFetchError,
    Partial<AuthClient["$Infer"]["Session"]["user"]>
  >
): UseMutationResult<
  { status: boolean },
  BetterFetchError,
  Partial<AuthClient["$Infer"]["Session"]["user"]>
> {
  const { authClient } = useAuth()
  const { data: sessionData, refetch } = useSession()
  const queryClient = useQueryClient()

  return useAuthMutation(authClient.updateUser, {
    ...options,
    onSuccess: (_, variables, ...rest) => {
      queryClient.setQueryData(["auth", "getSession"], {
        ...sessionData,
        user: { ...sessionData?.user, ...variables }
      })

      refetch()

      options?.onSuccess?.(_, variables, ...rest)
    }
  })
}
