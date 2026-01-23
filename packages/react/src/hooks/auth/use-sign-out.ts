import { useAuth } from "@better-auth-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { useCallback } from "react"

interface UseSignOutOptions {
  onError?: (error: BetterFetchError) => unknown | Promise<unknown>
  onSuccess?: () => unknown | Promise<unknown>
}

/**
 * Provides a sign-out action that signs the current user out, invalidates auth-related queries, and redirects to the sign-in view.
 *
 * @param options - Optional callbacks for error and success handling
 * @returns An object containing `signOut`, a function that performs the sign-out flow described above.
 */
export function useSignOut({ onError, onSuccess }: UseSignOutOptions = {}) {
  const queryClient = useQueryClient()
  const { authClient, basePaths, viewPaths, navigate } = useAuth()

  const signOut = useCallback(async () => {
    const { error } = await authClient.signOut()

    if (error) {
      await onError?.(error as BetterFetchError)
    } else {
      await onSuccess?.()
    }

    await queryClient.invalidateQueries({ queryKey: ["auth"] })

    navigate({
      href: `${basePaths.auth}/${viewPaths.auth.signIn}`,
      replace: true
    })
  }, [
    authClient,
    basePaths.auth,
    viewPaths.auth.signIn,
    navigate,
    onError,
    onSuccess,
    queryClient
  ])

  return { signOut }
}
