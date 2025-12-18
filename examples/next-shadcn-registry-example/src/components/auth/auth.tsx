"use client"

import type { AnyAuthConfig } from "@better-auth-ui/react"
import type { AuthView } from "@better-auth-ui/react/core"

import { useAuth } from "@/hooks/auth/use-auth"
import { ForgotPassword } from "./forgot-password"
import { MagicLink } from "./magic-link"
import type { SocialLayout } from "./provider-buttons"
import { ResetPassword } from "./reset-password"
import { SignIn } from "./sign-in"
import { SignOut } from "./sign-out"
import { SignUp } from "./sign-up"

export type AuthProps = AnyAuthConfig & {
  className?: string
  path?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  view?: AuthView
}

/**
 * Render the appropriate authentication view based on an explicit `view` or a route `path`.
 *
 * @param className - Optional CSS class applied to the rendered view container
 * @param path - Route path used to resolve which auth view to render when `view` is not provided
 * @param socialLayout - Layout for social provider buttons when applicable
 * @param socialPosition - Positioning for social provider buttons when applicable
 * @param view - Explicit auth view to render (e.g., `"signIn"`, `"signUp"`)
 * @param config - Remaining authentication configuration passed through to the view component
 * @returns The rendered authentication view element
 * @throws Error If neither `view` nor `path` is provided, or if the resolved view is not one of the valid auth views
 */
export function Auth({
  className,
  view,
  path,
  socialLayout,
  socialPosition,
  ...config
}: AuthProps) {
  const { viewPaths } = useAuth(config)

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
          {...config}
        />
      )
    case "signUp":
      return (
        <SignUp
          className={className}
          socialLayout={socialLayout}
          socialPosition={socialPosition}
          {...config}
        />
      )
    case "magicLink":
      return (
        <MagicLink
          className={className}
          socialLayout={socialLayout}
          socialPosition={socialPosition}
          {...config}
        />
      )
    case "forgotPassword":
      return <ForgotPassword className={className} {...config} />
    case "resetPassword":
      return <ResetPassword className={className} {...config} />
    case "signOut":
      return <SignOut className={className} {...config} />
    default:
      throw new Error(
        `[Better Auth UI] Valid views are: ${Object.keys(viewPaths.auth).join(", ")}`
      )
  }
}