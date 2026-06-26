import { viewPaths } from "@better-auth-ui/core"
import { Auth } from "@better-auth-ui/heroui"
import { magicLinkPlugin } from "@better-auth-ui/heroui/plugins/magic-link"
import { createFileRoute, notFound } from "@tanstack/react-router"

/** Keep in sync with `magicLinkPlugin(...)` in `providers.tsx` if you customize `path`. */
const validAuthPathSegments = new Set([
  ...Object.values(viewPaths.auth),
  magicLinkPlugin().viewPaths.auth.magicLink
])

export const Route = createFileRoute("/auth/$path")({
  beforeLoad({ params: { path } }) {
    if (!validAuthPathSegments.has(path)) {
      throw notFound()
    }
  },
  component: AuthPage
})

function AuthPage() {
  const { path } = Route.useParams()

  return (
    <div className="flex justify-center my-auto p-4 md:p-6">
      <Auth path={path} />
    </div>
  )
}
