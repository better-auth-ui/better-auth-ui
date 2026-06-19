import {
  ensureSession as ensureSessionClient,
  viewPaths
} from "@better-auth-ui/core"
import { ensureSessionServer } from "@better-auth-ui/core/server"
import { createFileRoute, notFound, redirect } from "@tanstack/solid-router"
import { createIsomorphicFn } from "@tanstack/solid-start"
import { getRequestHeaders } from "@tanstack/solid-start/server"

import { Settings } from "@/components/auth/settings/settings"
import { auth } from "@/lib/auth"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { authClient } from "@/lib/auth-client"

const validSettingsPaths = [
  ...Object.values(viewPaths.settings),
  ...Object.values(organizationPlugin().viewPaths.settings ?? {})
]

export const Route = createFileRoute("/settings/$path")({
  async beforeLoad({ params: { path }, context: { queryClient }, location }) {
    if (!validSettingsPaths.includes(path)) {
      throw notFound()
    }

    const ensureSession = createIsomorphicFn()
      .server(() =>
        ensureSessionServer(queryClient, auth, { headers: getRequestHeaders() })
      )
      .client(() => ensureSessionClient(queryClient, authClient))

    const session = await ensureSession()

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
  const path = () => Route.useParams()().path

  return (
    <div class="mx-auto w-full max-w-3xl p-4 md:p-6">
      <Settings path={path()} />
    </div>
  )
}
