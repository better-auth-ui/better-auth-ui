import { createFileRoute, redirect } from "@tanstack/solid-router"

import { AuthProvider } from "@/components/auth/auth-provider"
import { resolveAuthRoute } from "@/routes/auth/-route-components"

export const Route = createFileRoute("/auth/$path")({
  beforeLoad({ params: { path } }) {
    const authRoute = resolveAuthRoute(path)

    if ("redirectTo" in authRoute) throw redirect({ to: authRoute.redirectTo })
  },
  component: AuthPage
})

function AuthPage() {
  const authRoute = resolveAuthRoute(Route.useParams()().path)

  if ("redirectTo" in authRoute) return null

  const Component = authRoute.component

  return (
    <div class="flex justify-center my-auto p-4 md:p-6">
      <AuthProvider>{() => <Component />}</AuthProvider>
    </div>
  )
}
