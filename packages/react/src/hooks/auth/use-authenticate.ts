import { useEffect } from "react"
import { useAuth } from "../../components/auth/auth-provider"
import type { AuthClient } from "../../lib/auth-client"
import {
  type UseSessionOptions,
  useSession
} from "../../queries/auth/session-query"

/**
 * Calls `useSession` and redirects unauthenticated users to the sign-in page,
 * preserving the current URL as a `redirectTo` query param.
 *
 * @param authClient - The Better Auth client.
 * @param options - `getSession` params & `useQuery` options.
 */
export function useAuthenticate<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseSessionOptions<TAuthClient>
) {
  const { basePaths, viewPaths, navigate } = useAuth()
  const session = useSession(authClient, options)

  useEffect(() => {
    if (session.data || session.isPending) return

    const signInBase = `${basePaths.auth}/${viewPaths.auth.signIn}`

    // `window.location` is web-only; under React Native there is no URL to
    // preserve, so we redirect to sign-in by view identity instead.
    const currentURL =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : undefined

    const signInPath = currentURL
      ? `${signInBase}?redirectTo=${encodeURIComponent(currentURL)}`
      : signInBase

    navigate({
      to: signInPath,
      view: "signIn",
      params: currentURL ? { redirectTo: currentURL } : undefined,
      replace: true
    })
  }, [
    basePaths.auth,
    session.data,
    session.isPending,
    viewPaths.auth.signIn,
    navigate
  ])

  return session
}
