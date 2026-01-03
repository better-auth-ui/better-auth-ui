import type { AnyAuthConfig } from "@better-auth-ui/react"
import type { DefinedInitialDataOptions } from "@tanstack/react-query"
import { useEffect } from "react"

import { useAuth } from "./use-auth"
import { useSession } from "./use-session"

/**
 * Redirects unauthenticated users to the sign-in page (preserving the current URL) and exposes the active auth session.
 *
 * @param config - Optional partial AuthConfig used to customize auth behavior.
 * @param options - Optional query options for the underlying session query.
 * @returns Result of useSession hook containing session data and query state.
 */
export function useAuthenticate(
  config?: AnyAuthConfig,
  options?: Partial<DefinedInitialDataOptions>
) {
  const { basePaths, viewPaths, replace } = useAuth(config)
  const { data, isPending, ...rest } = useSession(config, options)

  useEffect(() => {
    if (data || isPending) return

    const currentURL = window.location.pathname + window.location.search
    const redirectTo = encodeURIComponent(currentURL)
    const signInPath = `${basePaths.auth}/${viewPaths.auth.signIn}?redirectTo=${redirectTo}`

    replace(signInPath)
  }, [basePaths.auth, data, isPending, viewPaths.auth.signIn, replace])

  return { data, isPending, ...rest }
}
