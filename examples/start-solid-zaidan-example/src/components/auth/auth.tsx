import { viewPaths } from "@better-auth-ui/core"
import type { Component } from "solid-js"

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
  const authRoute = resolveAuthRoute(props.path ?? "")

  if ("redirectTo" in authRoute) return null

  const Component = authRoute.component

  return <Component />
}
