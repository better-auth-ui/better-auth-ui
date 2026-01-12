import { useAuth } from "@better-auth-ui/react"
import type { AuthView } from "@better-auth-ui/react/core"
import type { CardProps } from "@heroui/react"

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
  variant?: CardProps["variant"]
  view?: AuthView
}

/**
 * Render the appropriate authentication view based on the provided `view` or `path`.
 *
 * @param path - Route path used to resolve an auth view when `view` is not provided
 * @param socialLayout - Social layout to apply to sign-in/sign-up/magic-link views
 * @param socialPosition - Position for social buttons ("top" or "bottom")
 * @param variant - Variant to apply to the card
 * @param view - Explicit auth view to render (e.g., "signIn", "signUp")
 * @returns The React element for the resolved authentication view
 */
export function Auth({
  path,
  socialLayout,
  socialPosition,
  view,
  ...props
}: AuthProps & CardProps) {
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
          socialLayout={socialLayout}
          socialPosition={socialPosition}
          {...props}
        />
      )
    case "signUp":
      return (
        <SignUp
          socialLayout={socialLayout}
          socialPosition={socialPosition}
          {...props}
        />
      )
    case "magicLink":
      return (
        <MagicLink
          socialLayout={socialLayout}
          socialPosition={socialPosition}
          {...props}
        />
      )
    case "forgotPassword":
      return <ForgotPassword {...props} />
    case "resetPassword":
      return <ResetPassword {...props} />
    case "signOut":
      return <SignOut {...props} />
    default:
      throw new Error(
        `[Better Auth UI] Valid views are: ${Object.keys(viewPaths.auth).join(", ")}`
      )
  }
}
