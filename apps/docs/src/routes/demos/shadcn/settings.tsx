import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/settings")({
  component: RouteComponent
})

import { Settings } from "@better-auth-ui/shadcn"

/**
 * Renders the settings demo page inside a responsive container.
 *
 * @returns The JSX element containing a centered container with the Settings component configured for the "account" view.
 */
function RouteComponent() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <Settings view="account" />
    </div>
  )
}
