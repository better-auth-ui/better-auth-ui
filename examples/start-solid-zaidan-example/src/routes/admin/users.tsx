import { ensureSession } from "@better-auth-ui/core"
import { ensureSessionServer } from "@better-auth-ui/core/server"
import { createFileRoute, redirect } from "@tanstack/solid-router"
import { createIsomorphicFn } from "@tanstack/solid-start"
import { getRequestHeaders } from "@tanstack/solid-start/server"

import { Admin } from "@/components/auth/admin/admin"
import { auth } from "@/lib/auth"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/admin/users")({
  async beforeLoad({ context: { queryClient }, location }) {
    const session = await createIsomorphicFn()
      .server(() =>
        ensureSessionServer(queryClient, auth, { headers: getRequestHeaders() })
      )
      .client(() => ensureSession(queryClient, authClient))()

    if (!session) {
      throw redirect({
        to: "/auth/$path",
        params: { path: "sign-in" },
        search: { redirectTo: location.href }
      })
    }
  },
  component: AdminUsersPage
})

function AdminUsersPage() {
  return (
    <main class="mx-auto w-full max-w-6xl p-4 md:p-6">
      <Admin view="users" />
    </main>
  )
}
