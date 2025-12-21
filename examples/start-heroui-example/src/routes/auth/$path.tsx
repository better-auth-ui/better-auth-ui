import { Auth } from "@better-auth-ui/heroui"
import { viewPaths } from "@better-auth-ui/heroui/core"
import { createFileRoute, notFound } from "@tanstack/react-router"

export const Route = createFileRoute("/auth/$path")({
  beforeLoad({ params: { path } }) {
    if (!Object.values(viewPaths.auth).includes(path)) {
      throw notFound()
    }
  },
  component: AuthPage
})

function AuthPage() {
  const { path } = Route.useParams()

  return (
    <div className="mx-auto my-auto flex w-full justify-center p-4">
      <Auth path={path} />
    </div>
  )
}
