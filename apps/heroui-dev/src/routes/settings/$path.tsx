import { ensureSession, viewPaths } from "@better-auth-ui/core"
import { Settings } from "@better-auth-ui/heroui"
import { organizationPlugin } from "@better-auth-ui/heroui/plugins"
import { ensureSession as ensureSessionServer } from "@better-auth-ui/react/server"
import { createFileRoute, notFound, redirect } from "@tanstack/react-router"
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/lib/auth"
import { authClient } from "@/lib/auth-client"

/** Same pattern as magic-link: spread plugin `viewPaths.settings` into the allowed segment set. */
const validSettingsPaths = [
  ...Object.values(viewPaths.settings),
  ...Object.values(organizationPlugin().viewPaths.settings)
]

export const Route = createFileRoute("/settings/$path")({
  async beforeLoad({ params: { path }, context: { queryClient }, location }) {
    if (!validSettingsPaths.includes(path)) {
      throw notFound()
    }

    const isomorphicEnsureSession = createIsomorphicFn()
      .server(() =>
        ensureSessionServer(queryClient, auth, { headers: getRequestHeaders() })
      )
      .client(() => ensureSession(queryClient, authClient))

    const session = await isomorphicEnsureSession()

    if (!session) {
      throw redirect({
        to: "/auth/$path",
        params: { path: "sign-in" },
        search: { redirectTo: location.href }
      })
    }

    return { session }
  },
  component: SettingsPage
})

function SettingsPage() {
  const { path } = Route.useParams()

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6">
      <Settings path={path} />
    </div>
  )
}
