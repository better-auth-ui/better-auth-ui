import { Settings } from "@better-auth-ui/heroui"
import { viewPaths } from "@better-auth-ui/heroui/core"
import { notFound } from "next/navigation"

export default async function SettingsPage({
  params
}: {
  params: Promise<{
    path: string
  }>
}) {
  const { path } = await params

  if (!Object.values(viewPaths.settings).includes(path)) {
    notFound()
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      <Settings path={path} />
    </div>
  )
}
