import { getAuthRedirectAction } from "@better-auth-ui/core"
import { useAuth, useSession } from "@better-auth-ui/solid"
import { createEffect } from "solid-js"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export type AuthRedirectProps = {
  class?: string
}

/**
 * Redirects authenticated users to a validated same-origin target.
 *
 * Signed-out users are sent through the sign-in view first. The redirect view
 * is preserved as the post-authentication destination so API callbacks receive
 * a full-page request after the session is established.
 */
export function AuthRedirect(props: AuthRedirectProps) {
  const auth = useAuth()
  const session = useSession(auth.authClient)
  let hasRedirected = false

  createEffect(() => {
    if (session.isPending || hasRedirected) return
    hasRedirected = true

    const action = getAuthRedirectAction(
      new URL(window.location.href),
      Boolean(session.data),
      `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`
    )

    window.location.replace(action.to)
  })

  return <Spinner class={cn("mx-auto my-auto", props.class)} />
}
