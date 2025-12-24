import { type AnyAuthConfig, useSession } from "@better-auth-ui/react"
import type { DefinedInitialDataOptions } from "@tanstack/react-query"
import { useEffect } from "react"
import { useAuth } from "./use-auth"

/**
 * Redirects unauthenticated users to the sign-in page (preserving the current URL) and exposes the active auth session.
 *
 * @param config - Optional partial AuthConfig used to customize auth behavior; may include an `authClient` override.
 * @param options - Optional query options.
 * @returns Result of useSession hook from the auth client
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
