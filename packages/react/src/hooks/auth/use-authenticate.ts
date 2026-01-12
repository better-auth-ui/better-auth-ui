import { useAuth } from "@better-auth-ui/react"
import type { DefinedInitialDataOptions } from "@tanstack/react-query"
import { useEffect } from "react"

import { useSession } from "./use-session"

/**
 * Redirects unauthenticated users to the sign-in page while preserving the current URL and exposes the active auth session state.
 *
 * @param options - Query options forwarded to the session query hook
 * @returns An object containing `data` (the current session or `undefined`), `isPending` (whether the session query is in progress), and other session query state
 */
export function useAuthenticate(options?: Partial<DefinedInitialDataOptions>) {
  const { basePaths, viewPaths, navigate } = useAuth()
  const { data, isPending, ...rest } = useSession(options)

  useEffect(() => {
    if (data || isPending) return

    const currentURL = window.location.pathname + window.location.search
    const redirectTo = encodeURIComponent(currentURL)
    const signInPath = `${basePaths.auth}/${viewPaths.auth.signIn}?redirectTo=${redirectTo}`

    navigate({ href: signInPath, replace: true })
  }, [basePaths.auth, data, isPending, viewPaths.auth.signIn, navigate])

  return { data, isPending, ...rest }
}
