import { Settings } from "@better-auth-ui/shadcn"
import { viewPaths } from "@better-auth-ui/shadcn/core"
import { createFileRoute, notFound } from "@tanstack/react-router"

export const Route = createFileRoute("/settings/$path")({
  beforeLoad({ params: { path } }) {
    if (!Object.values(viewPaths.settings).includes(path)) {
      throw notFound()
    }
  },
  component: SettingsPage
})

function SettingsPage() {
  const { path } = Route.useParams()

  return (
    <div className="min-h-svh container mx-auto p-4 md:p-6">
      <Settings path={path} />
    </div>
  )
}
