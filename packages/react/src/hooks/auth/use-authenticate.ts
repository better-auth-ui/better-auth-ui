import type { AuthClient } from "@better-auth-ui/core"
import type { QueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useAuth } from "../../components/auth/auth-provider"
import { type UseSessionOptions, useSession } from "../queries/use-session"

/**
 * Calls `useSession` and redirects unauthenticated users to the sign-in page,
 * preserving the current URL as a `redirectTo` query param.
 *
 * @param authClient - The Better Auth client.
 * @param options - `getSession` params & `useQuery` options.
 * @param queryClient - Optional React Query client override.
 */
export function useAuthenticate<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseSessionOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { basePaths, viewPaths, navigate } = useAuth()
  const session = useSession(authClient, options, queryClient)

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
