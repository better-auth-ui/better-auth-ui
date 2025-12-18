import { Auth } from "@better-auth-ui/heroui"
import { viewPaths } from "@better-auth-ui/heroui/core"
import { notFound } from "next/navigation"

/**
 * Validates the route path and renders the authentication UI for that path.
 *
 * If the resolved `path` is not one of the configured auth view paths, this component invokes `notFound()` to render a 404 page.
 *
 * @param params - A promise that resolves to an object containing the route `path` to validate and render.
 * @returns A React element that centers and renders the Auth component for the validated `path`.
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
