import { Settings } from "@better-auth-ui/heroui"
import { viewPaths } from "@better-auth-ui/heroui/core"
import { createFileRoute, notFound } from "@tanstack/react-router"

export const Route = createFileRoute("/settings/$path")({
  beforeLoad({ params: { path } }) {
    if (!Object.values(viewPaths.settings).includes(path)) {
      throw notFound()
    }
  },
  component: SettingsPage
})

/**
 * Renders the settings page for the current dynamic settings path.
 *
 * @returns A React element that wraps the Settings component for the active route path
 */
function SettingsPage() {
  const { path } = Route.useParams()

  return (
    <div className="min-h-svh container mx-auto p-4 md:p-6">
      <Settings path={path} />
    </div>
  )
}