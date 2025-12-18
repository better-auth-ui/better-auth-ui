import { viewPaths } from "@better-auth-ui/react/core"
import { notFound } from "next/navigation"

import { Auth } from "@/components/auth/auth"

/**
 * Render the authentication page corresponding to the route `path`.
 *
 * Awaits the route `params`, validates that `path` is one of the allowed auth view paths, and returns a centered container rendering the `Auth` component for that `path`.
 *
 * @param params - Promise resolving to the route parameters object containing `path`
 * @returns The React element for the authenticated route view; if `path` is not allowed, triggers a 404 response
 */
export default async function AuthPage({
  params
}: {
  params: Promise<{
    path: string
  }>
}) {
  const { path } = await params

  if (!Object.values(viewPaths.auth).includes(path)) {
    notFound()
  }

  return (
    <div className="min-h-svh flex items-center justify-center p-4">
      <Auth path={path} />
    </div>
  )
}