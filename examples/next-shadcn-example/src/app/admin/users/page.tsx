import { ensureSessionServer } from "@better-auth-ui/core/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { Admin } from "@/components/auth/admin/admin"
import { auth } from "@/lib/auth"
import { getQueryClient } from "@/lib/query-client"

export default async function AdminUsersPage() {
  const queryClient = getQueryClient()
  const session = await ensureSessionServer(queryClient, auth, {
    headers: await headers()
  })

  if (!session) redirect("/auth/sign-in?redirectTo=%2Fadmin%2Fusers")

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="mx-auto w-full max-w-6xl p-4 md:p-6">
        <Admin view="users" />
      </main>
    </HydrationBoundary>
  )
}
