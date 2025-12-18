import type { AnyAuthClient, AnyAuthConfig } from "@better-auth-ui/react"
import { useEffect } from "react"

import { useAuth } from "./use-auth"

/**
 * Redirects unauthenticated users to the sign-in page (preserving the current URL) and exposes the active auth session.
 *
 * @param config - Optional partial AuthConfig used to customize auth behavior; may include an `authClient` override.
 * @returns Result of useSession hook from the auth client
 */
export function useAuthenticate<TAuthClient extends AnyAuthClient>(
  config?: AnyAuthConfig & { authClient?: TAuthClient }
) {
  const { authClient, basePaths, viewPaths, replace } = useAuth(config)
  const { data, isPending, ...rest } = (
    authClient as unknown as TAuthClient
  ).useSession()

  useEffect(() => {
    if (data || isPending) return

    const currentURL = window.location.pathname + window.location.search
    const redirectTo = encodeURIComponent(currentURL)
    const signInPath = `${basePaths.auth}/${viewPaths.auth.signIn}?redirectTo=${redirectTo}`

    replace(signInPath)
  }, [basePaths.auth, data, isPending, viewPaths.auth.signIn, replace])

  return { data, isPending, ...rest }
}
