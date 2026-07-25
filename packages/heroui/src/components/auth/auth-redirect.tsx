import { getAuthRedirectAction } from "@better-auth-ui/core"
import { useAuth, useSession } from "@better-auth-ui/react"
import { cn, Spinner } from "@heroui/react"
import { useEffect, useRef } from "react"

export type AuthRedirectProps = {
  className?: string
}

/**
 * Redirect authenticated users to a validated same-origin target.
 *
 * Signed-out users are sent through the sign-in view first. The redirect view
 * is preserved as the post-authentication destination so API callbacks receive
 * a full-page request after the session is established.
 *
 * @param className - Additional classes applied to the loading indicator
 * @returns A centered spinner while the session and redirect resolve
 */
export function AuthRedirect({ className }: AuthRedirectProps) {
  const { authClient, basePaths, viewPaths } = useAuth()
  const { data: session, isPending } = useSession(authClient)
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (isPending || hasRedirected.current) return
    hasRedirected.current = true

    const action = getAuthRedirectAction(
      new URL(window.location.href),
      Boolean(session),
      `${basePaths.auth}/${viewPaths.auth.signIn}`
    )

    window.location.replace(action.to)
  }, [basePaths.auth, isPending, session, viewPaths.auth.signIn])

  return (
    <Spinner className={cn("mx-auto my-auto", className)} color="current" />
  )
}
