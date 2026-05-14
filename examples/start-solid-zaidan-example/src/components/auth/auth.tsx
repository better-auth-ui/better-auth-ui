import { type AuthView, viewPaths } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/solid"
import type { Component } from "solid-js"
import { createEffect } from "solid-js"
import { Dynamic } from "solid-js/web"

import { ForgotPassword } from "./forgot-password"
import type { SocialLayout } from "./provider-buttons"
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
  class?: string
  path?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  view?: AuthView
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

const EmptyAuthView: Component<AuthProps> = () => null

export function resolveAuthRoute(
  path: string
): SupportedAuthRoute | UnsupportedAuthRoute {
  const route = authRouteComponents[path]

  return route ?? { redirectTo: "/" }
}

export function Auth(props: AuthProps) {
  const auth = useAuth()
  const currentView = () =>
    props.view ??
    (Object.keys(auth.viewPaths.auth) as AuthView[]).find(
      (key) => auth.viewPaths.auth[key] === props.path
    )
  const authView = () => currentView()
  const shouldRedirectToSignIn = () =>
    !auth.emailAndPassword?.enabled &&
    authView() &&
    passwordOnlyViews.includes(authView() as AuthView)

  const PluginComponent = () => {
    for (const plugin of auth.plugins as AuthPluginWithViews[]) {
      const pluginView =
        props.view ??
        authView() ??
        (Object.keys(plugin.viewPaths?.auth ?? {}) as AuthView[]).find(
          (key) => plugin.viewPaths?.auth?.[key] === props.path
        )
      const PluginView = pluginView
        ? plugin.views?.auth?.[pluginView]
        : undefined

      if (PluginView) return PluginView
    }
  }

  const FallbackComponent = () => {
    if (authView() !== "signIn" || auth.emailAndPassword?.enabled) return

    return (auth.plugins as AuthPluginWithViews[]).find(
      (plugin) => plugin.fallbackViews?.auth?.signIn
    )?.fallbackViews?.auth?.signIn
  }

  const RouteComponent = () => {
    const view = authView()
    if (!view) return

    const authPath = auth.viewPaths.auth[view]
    if (!authPath) return

    const route = resolveAuthRoute(authPath)

    return "redirectTo" in route
      ? undefined
      : (route.component as Component<AuthProps>)
  }

  const AuthComponent = () =>
    shouldRedirectToSignIn()
      ? EmptyAuthView
      : (PluginComponent() ??
        FallbackComponent() ??
        RouteComponent() ??
        EmptyAuthView)

  createEffect(() => {
    if (shouldRedirectToSignIn()) {
      auth.navigate({
        replace: true,
        to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`
      })
    }
  })

  return (
    <Dynamic
      component={AuthComponent()}
      class={props.class}
      socialLayout={props.socialLayout}
      socialPosition={props.socialPosition}
    />
  )
}
