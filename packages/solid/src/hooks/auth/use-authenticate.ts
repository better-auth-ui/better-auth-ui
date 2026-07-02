import type { AuthClient } from "@better-auth-ui/core"
import type { QueryClient } from "@tanstack/solid-query"
import { type Accessor, createEffect } from "solid-js"
import { isServer } from "solid-js/web"
import { useAuth } from "../../lib/auth-provider"
import { type UseSessionOptions, useSession } from "../queries/use-session"

/**
 * Calls `useSession` and redirects unauthenticated users to the sign-in page.
 *
 * @param authClient - The Better Auth client.
 * @param options - `getSession` params and Solid Query options.
 * @param queryClient - Optional Solid Query client accessor override.
 */
export function useAuthenticate<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseSessionOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const config = useAuth()
  const session = useSession(authClient, options, queryClient)

  createEffect(() => {
    if (session.data || session.isPending) return

    const currentURL = isServer
      ? "/"
      : window.location.pathname + window.location.search
    const redirectTo = encodeURIComponent(currentURL)
    const signInPath = `${config.basePaths.auth}/${config.viewPaths.auth.signIn}?redirectTo=${redirectTo}`

    config.navigate({ to: signInPath, replace: true })
  })

  return session
}
