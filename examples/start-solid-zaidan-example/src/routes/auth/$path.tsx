import { viewPaths } from "@better-auth-ui/core"
import { createFileRoute, redirect } from "@tanstack/solid-router"

import { SignIn } from "@/components/auth/sign-in"

export const Route = createFileRoute("/auth/$path")({
  beforeLoad({ params: { path } }) {
    if (!Object.values(viewPaths.auth).includes(path)) {
      throw redirect({ to: "/" })
    }
  },
  component: AuthPage
})

function AuthPage() {
  return <SignIn />
}
