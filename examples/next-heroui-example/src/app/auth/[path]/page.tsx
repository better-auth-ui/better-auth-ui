import { viewPaths } from "@better-auth-ui/heroui/core"
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

  if (!Object.values(viewPaths.auth).includes(path)) {
    notFound()
  }

  return (
    <div className="min-h-svh flex items-center justify-center p-4">
      <Auth path={path} />
    </div>
  )
}
