import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/settings")({
  component: RouteComponent
})

import { Settings } from "@better-auth-ui/heroui"

/**
 * Renders the demo settings page component.
 *
 * @returns The JSX element containing a responsive container with the Settings component configured for the "account" view.
 */
function RouteComponent() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <Settings view="account" />
    </div>
  )
}
