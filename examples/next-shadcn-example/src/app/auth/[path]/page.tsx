import { viewPaths } from "@better-auth-ui/core"
import { magicLinkPlugin } from "@better-auth-ui/core/plugins/magic-link"
import { notFound } from "next/navigation"

import { Auth } from "@/components/auth/auth"

const validAuthPaths = new Set([
  ...Object.values(viewPaths.auth),
  ...Object.values(magicLinkPlugin().viewPaths.auth ?? {})
])

export default async function AuthPage({
  params
}: {
  params: Promise<{
    path: string
  }>
}) {
  const { path } = await params

  if (!validAuthPaths.has(path)) {
    notFound()
  }

  return (
    <div className="flex justify-center my-auto p-4 md:p-6">
      <Auth path={path} />
    </div>
  )
}
