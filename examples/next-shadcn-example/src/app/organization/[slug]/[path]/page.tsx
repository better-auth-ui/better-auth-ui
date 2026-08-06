import { organizationPlugin } from "@better-auth-ui/core/plugins/organization"
import { ensureSessionServer } from "@better-auth-ui/core/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"

import { Organization } from "@/components/auth/organization/organization"
import { auth } from "@/lib/auth"
import { getQueryClient } from "@/lib/query-client"

const validOrganizationPaths = new Set(
  Object.values(organizationPlugin().viewPaths.organization ?? {})
)

export default async function OrganizationPage({
  params
}: {
  params: Promise<{
    slug: string
    path: string
  }>
}) {
  const { slug, path } = await params

  if (!validOrganizationPaths.has(path)) {
    notFound()
  }

  const requestHeaders = await headers()
  const queryClient = getQueryClient()

  const session = await ensureSessionServer(queryClient, auth, {
    headers: requestHeaders
  })

  if (!session) {
    redirect(
      `/auth/sign-in?redirectTo=${encodeURIComponent(`/organization/${slug}/${path}`)}`
    )
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        <Organization path={path} />
      </div>
    </HydrationBoundary>
  )
}
