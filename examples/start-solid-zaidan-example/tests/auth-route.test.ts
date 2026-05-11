import { viewPaths } from "@better-auth-ui/core"
import { describe, expect, it } from "vitest"

import { ForgotPassword } from "../src/components/auth/forgot-password"
import { ResetPassword } from "../src/components/auth/reset-password"
import { SignIn } from "../src/components/auth/sign-in"
import { SignOut } from "../src/components/auth/sign-out"
import { SignUp } from "../src/components/auth/sign-up"
import { resolveAuthRoute } from "../src/routes/auth/-route-components"

describe("Solid auth route component selection", () => {
  it("maps supported auth paths to their existing Solid components", () => {
    expect(resolveAuthRoute(viewPaths.auth.signIn)).toEqual({
      component: SignIn,
      title: "Sign in"
    })
    expect(resolveAuthRoute(viewPaths.auth.signUp)).toEqual({
      component: SignUp,
      title: "Sign up"
    })
    expect(resolveAuthRoute(viewPaths.auth.signOut)).toEqual({
      component: SignOut,
      title: "Sign out"
    })
    expect(resolveAuthRoute(viewPaths.auth.forgotPassword)).toEqual({
      component: ForgotPassword,
      title: "Forgot password"
    })
    expect(resolveAuthRoute(viewPaths.auth.resetPassword)).toEqual({
      component: ResetPassword,
      title: "Reset password"
    })
  })

  it("keeps invalid auth paths on the existing redirect-to-home behavior", () => {
    expect(resolveAuthRoute("unknown-auth-path")).toEqual({ redirectTo: "/" })
  })
})
