import { ensureSession } from "@better-auth-ui/core"
import { ensureSessionServer } from "@better-auth-ui/core/server"
import {
  Organization,
  organizationPlugin
} from "@better-auth-ui/heroui/plugins"
import { createFileRoute, notFound, redirect } from "@tanstack/react-router"
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth"
import { authClient } from "@/lib/auth-client"

/** Segments from `organizationPlugin().viewPaths.organization` (same options as `<AuthProvider>`). */
const validOrganizationPaths = Object.values(
  organizationPlugin().viewPaths.organization
)

export const Route = createFileRoute("/organization/@{$slug}/$path")({
  async beforeLoad({ params: { path }, context: { queryClient }, location }) {
    if (!validOrganizationPaths.includes(path)) {
      throw notFound()
    }

    const ensureSessionIso = createIsomorphicFn()
      .server(() =>
        ensureSessionServer(queryClient, auth, { headers: getRequestHeaders() })
      )
      .client(() => ensureSession(queryClient, authClient))

    const session = await ensureSessionIso()

    if (!session) {
      throw redirect({
        to: "/auth/$path",
        params: { path: "sign-in" },
        search: { redirectTo: location.href }
      })
    }

    return { session }
  },
  component: OrganizationPage
})

function OrganizationPage() {
  const { path } = Route.useParams()

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <Organization path={path} />
    </div>
  )
}
