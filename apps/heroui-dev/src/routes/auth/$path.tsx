import { viewPaths } from "@better-auth-ui/core"
import { Auth } from "@better-auth-ui/heroui"
import {
  deviceAuthorizationPlugin,
  magicLinkPlugin
} from "@better-auth-ui/heroui/plugins"
import { createFileRoute, notFound } from "@tanstack/react-router"

/** Keep in sync with the auth-view plugins in `providers.tsx` if paths are customized. */
const validAuthPathSegments = new Set([
  ...Object.values(viewPaths.auth),
  deviceAuthorizationPlugin().viewPaths.auth.deviceAuthorization,
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
