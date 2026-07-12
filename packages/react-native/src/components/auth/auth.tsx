import type { AuthView } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/react"
import { type ComponentType, useEffect } from "react"
import { useAuthNavigation } from "../../navigation/navigation-context"
import type { CardVariant } from "../../primitives/card"
import { ForgotPassword } from "./forgot-password"
import type { SocialLayout } from "./provider-buttons"
import { ResetPassword } from "./reset-password"
import { SignIn } from "./sign-in"
import { SignOut } from "./sign-out"
import { SignUp } from "./sign-up"
import { VerifyEmail } from "./verify-email"

export type AuthProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardVariant
  /** Explicit view. Omit under the state adapter to use the adapter's view. */
  view?: AuthView
  /** Deep-link token for token-bearing views (reset-password). */
  token?: string
}

/**
 * Built-in views that only make sense when email + password auth is enabled.
 * When it's disabled, these redirect to `signIn`.
 */
const PASSWORD_ONLY_VIEWS: AuthView[] = [
  "signUp",
  "forgotPassword",
  "resetPassword"
]

const AUTH_VIEWS: Partial<Record<AuthView, ComponentType<AuthProps>>> = {
  signIn: SignIn,
  signOut: SignOut,
  signUp: SignUp,
  forgotPassword: ForgotPassword,
  resetPassword: ResetPassword,
  verifyEmail: VerifyEmail
}

/**
 * Card switcher: renders the auth view resolved from the `view` prop or, under
 * the state adapter, the navigation adapter's current view. Mirrors the heroui
 * `Auth` switcher; plugin views (e.g. magic-link) arrive in a follow-up.
 */
export function Auth({
  className,
  socialLayout,
  socialPosition,
  variant,
  view,
  token
}: AuthProps) {
  const { emailAndPassword, plugins } = useAuth()
  const navigation = useAuthNavigation()

  const current = navigation.current()
  const authView =
    view ?? (current?.section === "auth" ? current.view : undefined) ?? "signIn"

  const shouldRedirectToSignIn =
    !emailAndPassword?.enabled && PASSWORD_ONLY_VIEWS.includes(authView)

  useEffect(() => {
    if (shouldRedirectToSignIn) {
      navigation.push("signIn", { replace: true })
    }
  }, [shouldRedirectToSignIn, navigation])

  if (shouldRedirectToSignIn) return null

  const viewProps = { className, socialLayout, socialPosition, variant, token }

  // 1. Plugin view overrides (first plugin wins, even over built-ins) — this is
  //    how e.g. magic-link / username sign-in replace a view.
  for (const plugin of plugins) {
    const PluginView = plugin.views?.auth?.[authView]
    if (PluginView) return <PluginView {...viewProps} />
  }

  // 2. Plugin fallback for signIn when email+password is disabled (e.g. magic
  //    link becomes the primary passwordless sign-in surface).
  if (authView === "signIn" && !emailAndPassword?.enabled) {
    const Fallback = plugins.find(
      (plugin) => plugin.fallbackViews?.auth?.signIn
    )?.fallbackViews?.auth?.signIn
    if (Fallback) return <Fallback {...viewProps} />
  }

  const ViewComponent = AUTH_VIEWS[authView]

  if (!ViewComponent) {
    throw new Error(
      `[Better Auth UI] Unknown view "${authView}". Valid views are: ${Object.keys(
        AUTH_VIEWS
      ).join(", ")}`
    )
  }

  return <ViewComponent {...viewProps} />
}
