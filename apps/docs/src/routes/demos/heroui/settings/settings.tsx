import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/settings/settings")({
  component: RouteComponent
})

import { Settings } from "@better-auth-ui/heroui"

function RouteComponent() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <Settings view="account" />
    </div>
  )
}
