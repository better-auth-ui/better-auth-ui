import { useAuth } from "@better-auth-ui/react"
import type { AuthCallbackOptions } from "@better-auth-ui/react/core"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

/**
 * Provides a sign-out action that signs the current user out, invalidates auth-related queries, and redirects to the sign-in view.
 *
 * @param options - Optional callbacks for error and success handling
 * @returns An object containing `signOut`, a function that performs the sign-out flow described above.
 */
export function useSignOut({ onError, onSuccess }: AuthCallbackOptions = {}) {
  const queryClient = useQueryClient()
  const { authClient, basePaths, viewPaths, navigate } = useAuth()

  const signOut = useCallback(async () => {
    const { error } = await authClient.signOut()

    if (error) {
      await onError?.(error)
    } else {
      await onSuccess?.()
    }

    queryClient.removeQueries({ queryKey: ["auth"] })

    navigate({
      to: `${basePaths.auth}/${viewPaths.auth.signIn}`,
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
