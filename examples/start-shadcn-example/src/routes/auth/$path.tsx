import { Auth } from "@better-auth-ui/shadcn"
import { viewPaths } from "@better-auth-ui/shadcn/core"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/auth/$path")({
  beforeLoad({ params: { path } }) {
    if (!Object.values(viewPaths.auth).includes(path)) {
      throw redirect({ to: "/" })
    }
  },
  component: AuthPage
})

function AuthPage() {
  const { path } = Route.useParams()

  return (
    <div className="min-h-svh flex items-center justify-center p-4 md:p-6">
      <Auth path={path} />
    </div>
  )
}
