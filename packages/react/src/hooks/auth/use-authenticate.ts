import { type AuthClient, useAuth } from "@better-auth-ui/react"
import { useEffect } from "react"
import type { UseAuthQueryOptions, UseAuthQueryResult } from "./use-auth-query"
import { useSession } from "./use-session"

/**
 * Redirects unauthenticated users to the sign-in page while preserving the current URL and exposes the active auth session state.
 *
 * @param options - Query options forwarded to the session query hook
 * @returns An object containing `data` (the current session or `undefined`), `isPending` (whether the session query is in progress), and other session query state
 */
export function useAuthenticate(
  options?: Partial<UseAuthQueryOptions<AuthClient["getSession"]>>
): UseAuthQueryResult<AuthClient["getSession"]> {
  const { basePaths, viewPaths, navigate } = useAuth()
  const session = useSession(options)

  useEffect(() => {
    if (session.data || session.isPending) return

    const currentURL = window.location.pathname + window.location.search
    const redirectTo = encodeURIComponent(currentURL)
    const signInPath = `${basePaths.auth}/${viewPaths.auth.signIn}?redirectTo=${redirectTo}`

    navigate({ to: signInPath, replace: true })
  }, [
    basePaths.auth,
    session.data,
    session.isPending,
    viewPaths.auth.signIn,
    navigate
  ])

  return session
}
