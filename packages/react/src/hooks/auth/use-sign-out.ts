import { useAuth } from "@better-auth-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

export function useSignOut() {
  const queryClient = useQueryClient()
  const { authClient, basePaths, viewPaths, replace, toast } = useAuth()

  const signOut = useCallback(async () => {
    const { error } = await authClient.signOut()

    if (error) {
      toast.error(error.message || error.statusText)
    }

    await queryClient.invalidateQueries({ queryKey: ["auth"] })

    replace(`${basePaths.auth}/${viewPaths.auth.signIn}`)
  }, [
    authClient,
    basePaths.auth,
    viewPaths.auth.signIn,
    replace,
    queryClient,
    toast.error
  ])

  return { signOut }
}
