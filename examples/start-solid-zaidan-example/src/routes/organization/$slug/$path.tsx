import { ensureSession as ensureSessionClient } from "@better-auth-ui/core"
import { ensureSessionServer } from "@better-auth-ui/core/server"
import { createFileRoute, notFound, redirect } from "@tanstack/solid-router"
import { createIsomorphicFn } from "@tanstack/solid-start"
import { getRequestHeaders } from "@tanstack/solid-start/server"
import { Organization } from "@/components/auth/organization/organization"
import { auth } from "@/lib/auth"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { authClient } from "@/lib/auth-client"

const validOrganizationPaths = Object.values(
  organizationPlugin().viewPaths.organization ?? {}
)

export const Route = createFileRoute("/organization/$slug/$path")({
  async beforeLoad({ params: { path }, context: { queryClient }, location }) {
    if (!validOrganizationPaths.includes(path)) {
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
  component: OrganizationPage
})

function OrganizationPage() {
  const params = Route.useParams()

  return (
    <div class="mx-auto w-full max-w-3xl p-4 md:p-6">
      <Organization path={params().path} slug={params().slug} />
    </div>
  )
}
