import { viewPaths } from "@better-auth-ui/core"
import { organizationPlugin } from "@better-auth-ui/core/plugins/organization"
import { ensureSessionServer } from "@better-auth-ui/core/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"

import { Settings } from "@/components/auth/settings/settings"
import { auth } from "@/lib/auth"
import { getQueryClient } from "@/lib/query-client"

const validSettingsPaths = new Set([
  ...Object.values(viewPaths.settings),
  ...Object.values(organizationPlugin().viewPaths.settings ?? {})
])

export default async function SettingsPage({
  params
}: {
  params: Promise<{
    path: string
  }>
}) {
  const { path } = await params

  if (!validSettingsPaths.has(path)) {
    notFound()
  }

  const requestHeaders = await headers()
  const queryClient = getQueryClient()

  const session = await ensureSessionServer(queryClient, auth, {
    headers: requestHeaders
  })

  if (!session) {
    redirect(
      `/auth/sign-in?redirectTo=${encodeURIComponent(`/settings/${path}`)}`
    )
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="w-full max-w-3xl mx-auto p-4 md:p-6">
        <Settings path={path} />
      </div>
    </HydrationBoundary>
  )
}
