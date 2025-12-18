import { Auth } from "@better-auth-ui/shadcn"
import { viewPaths } from "@better-auth-ui/shadcn/core"
import { notFound } from "next/navigation"

/**
 * Renders a centered authentication page for a validated auth route or triggers a 404 for invalid routes.
 *
 * Awaits `params` to obtain `path`, verifies the path is a known auth route, and renders the Auth component for that path.
 *
 * @param params - A promise resolving to an object with a `path` string taken from the route parameters.
 * @returns A React element that centers and displays the Auth component for the validated `path`.
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