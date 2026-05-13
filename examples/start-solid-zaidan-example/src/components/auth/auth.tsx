import { type AuthView, viewPaths } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/solid"
import type { Component } from "solid-js"
import { createEffect } from "solid-js"

import { ForgotPassword } from "./forgot-password"
import { ResetPassword } from "./reset-password"
import { SignIn } from "./sign-in"
import { SignOut } from "./sign-out"
import { SignUp } from "./sign-up"

type SupportedAuthRoute = {
  component: Component
  title: string
}

type UnsupportedAuthRoute = {
  redirectTo: "/"
}

export type AuthProps = {
  path?: string
}

type AuthPluginView = Component<AuthProps>

type AuthPluginWithViews = {
  fallbackViews?: { auth?: Partial<Record<AuthView, AuthPluginView>> }
  viewPaths?: { auth?: Partial<Record<AuthView, string>> }
  views?: { auth?: Partial<Record<AuthView, AuthPluginView>> }
}

const passwordOnlyViews: AuthView[] = [
  "signUp",
  "forgotPassword",
  "resetPassword"
]

const authRouteComponents: Partial<Record<string, SupportedAuthRoute>> = {
  [viewPaths.auth.signIn]: { component: SignIn, title: "Sign in" },
  [viewPaths.auth.signUp]: {
    component: SignUp,
    title: "Sign up"
  },
  [viewPaths.auth.signOut]: {
    component: SignOut,
    title: "Sign out"
  },
  [viewPaths.auth.forgotPassword]: {
    component: ForgotPassword,
    title: "Forgot password"
  },
  [viewPaths.auth.resetPassword]: {
    component: ResetPassword,
    title: "Reset password"
  }
}

export function resolveAuthRoute(
  path: string
): SupportedAuthRoute | UnsupportedAuthRoute {
  const route = authRouteComponents[path]

  return route ?? { redirectTo: "/" }
}

export function Auth(props: AuthProps) {
  const auth = useAuth()
  const authRoute = resolveAuthRoute(props.path ?? "")
  const authView = (Object.keys(auth.viewPaths.auth) as AuthView[]).find(
    (key) => auth.viewPaths.auth[key] === props.path
  )
  const shouldRedirectToSignIn =
    !auth.emailAndPassword?.enabled &&
    authView &&
    passwordOnlyViews.includes(authView)

  createEffect(() => {
    if (shouldRedirectToSignIn) {
      auth.navigate({
        replace: true,
        to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`
      })
    }
  })

  if (shouldRedirectToSignIn) return null

  for (const plugin of auth.plugins as AuthPluginWithViews[]) {
    const pluginView =
      authView ??
      (Object.keys(plugin.viewPaths?.auth ?? {}) as AuthView[]).find(
        (key) => plugin.viewPaths?.auth?.[key] === props.path
      )
    const PluginView = pluginView ? plugin.views?.auth?.[pluginView] : undefined

    if (PluginView) return <PluginView />
  }

  if (authView === "signIn" && !auth.emailAndPassword?.enabled) {
    const Fallback = (auth.plugins as AuthPluginWithViews[]).find(
      (plugin) => plugin.fallbackViews?.auth?.signIn
    )?.fallbackViews?.auth?.signIn

    if (Fallback) return <Fallback />
  }

  if ("redirectTo" in authRoute) return null

  const Component = authRoute.component

  return <Component />
}
