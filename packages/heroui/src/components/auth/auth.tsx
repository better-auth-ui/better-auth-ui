import { useAuth } from "@better-auth-ui/react"
import type { AuthView } from "@better-auth-ui/react/core"

import { ForgotPassword } from "./forgot-password"
import { MagicLink } from "./magic-link"
import type { SocialLayout } from "./provider-buttons"
import { ResetPassword } from "./reset-password"
import { SignIn } from "./sign-in"
import { SignOut } from "./sign-out"
import { SignUp } from "./sign-up"

export type AuthProps = {
  className?: string
  path?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  view?: AuthView
}

/**
 * Render the appropriate authentication view based on the provided `view` or `path`.
 *
 * @param path - Route path used to resolve an auth view when `view` is not provided
 * @param socialLayout - Social layout to apply to sign-in/sign-up/magic-link views
 * @param socialPosition - Position for social buttons ("top" or "bottom")
 * @param view - Explicit auth view to render (e.g., "signIn", "signUp")
 * @returns The React element for the resolved authentication view
 */
export function Auth({
  className,
  view,
  path,
  socialLayout,
  socialPosition
}: AuthProps) {
  const { viewPaths } = useAuth()

  if (!view && !path) {
    throw new Error("[Better Auth UI] Either `view` or `path` must be provided")
  }

  const authPathViews = Object.fromEntries(
    Object.entries(viewPaths.auth).map(([k, v]) => [v, k])
  ) as Record<string, AuthView>

  const currentView = view || (path ? authPathViews[path] : undefined)

  switch (currentView) {
    case "signIn":
      return (
        <SignIn
          className={className}
          socialLayout={socialLayout}
          socialPosition={socialPosition}
        />
      )
    case "signUp":
      return (
        <SignUp
          className={className}
          socialLayout={socialLayout}
          socialPosition={socialPosition}
        />
      )
    case "magicLink":
      return (
        <MagicLink
          className={className}
          socialLayout={socialLayout}
          socialPosition={socialPosition}
        />
      )
    case "forgotPassword":
      return <ForgotPassword className={className} />
    case "resetPassword":
      return <ResetPassword className={className} />
    case "signOut":
      return <SignOut className={className} />
    default:
      throw new Error(
        `[Better Auth UI] Valid views are: ${Object.keys(viewPaths.auth).join(", ")}`
      )
  }
}