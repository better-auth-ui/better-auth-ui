import { viewPaths } from "@better-auth-ui/core"
import { createFileRoute, redirect } from "@tanstack/solid-router"

import { Auth } from "@/components/auth/auth"

export const Route = createFileRoute("/auth/$path")({
  beforeLoad({ params: { path } }) {
    if (!Object.values(viewPaths.auth).includes(path)) {
      throw redirect({ to: "/" })
    }
  },
  component: AuthPage
})

function AuthPage() {
  const { path } = Route.useParams()()

  return (
    <div class="flex justify-center my-auto p-4 md:p-6">
      <Auth path={path} />
    </div>
  )
}
