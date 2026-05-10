import { createEffect } from "solid-js"
import type { AuthClient } from "../../lib/auth-client"
import { useAuth } from "../../lib/auth-provider"
import {
  type UseSessionOptions,
  useSession
} from "../../queries/auth/session-query"

export function useAuthenticate<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseSessionOptions<TAuthClient>
) {
  const config = useAuth()
  const session = useSession(authClient, options)

  createEffect(() => {
    if (session.data || session.isPending) return

    const currentURL = window.location.pathname + window.location.search
    const redirectTo = encodeURIComponent(currentURL)
    const signInPath = `${config.basePaths.auth}/${config.viewPaths.auth.signIn}?redirectTo=${redirectTo}`

    config.navigate({ to: signInPath, replace: true })
  })

  return session
}
