import { viewPaths } from "@better-auth-ui/core"
import { createFileRoute, redirect } from "@tanstack/solid-router"

import { AuthProvider } from "@/components/auth/auth-provider"
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
  return (
    <AuthProvider>
      <SignIn />
    </AuthProvider>
  )
}
