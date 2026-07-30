import { viewPaths } from "@better-auth-ui/core"
import { Auth } from "@better-auth-ui/heroui"
import { notFound } from "next/navigation"

export default async function AuthPage({
  params
}: {
  params: Promise<{
    path: string
  }>
}) {
  const { path } = await params

  // Plugin-contributed views (e.g. phone-verification) aren't in the static
  // viewPaths, so allow them explicitly.
  const pluginPaths = ["phone-verification"]

  if (
    !Object.values(viewPaths.auth).includes(path) &&
    !pluginPaths.includes(path)
  ) {
    notFound()
  }

  return (
    <div className="flex justify-center my-auto p-4 md:p-6">
      <Auth path={path} />
    </div>
  )
}
