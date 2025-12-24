import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useCallback } from "react"

import { useAuth } from "./use-auth"

export function useSignOut(config?: AnyAuthConfig) {
  const { authClient, basePaths, queryClient, viewPaths, replace, toast } =
    useAuth(config)

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
