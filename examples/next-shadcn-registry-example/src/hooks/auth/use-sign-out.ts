import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useCallback } from "react"

import { useAuth } from "./use-auth"

export function useSignOut(config?: AnyAuthConfig) {
  const { authClient, basePaths, viewPaths, navigate, toast } = useAuth(config)
  const { refetch } = authClient.useSession()

  const signOut = useCallback(async () => {
    const { error } = await authClient.signOut({
      fetchOptions: { disableSignal: true }
    })

    if (error) {
      toast.error(error.message || error.statusText)
    }

    await refetch()

    navigate(`${basePaths.auth}/${viewPaths.auth.signIn}`)
  }, [
    authClient,
    basePaths.auth,
    viewPaths.auth.signIn,
    navigate,
    refetch,
    toast.error
  ])

  return { signOut }
}
