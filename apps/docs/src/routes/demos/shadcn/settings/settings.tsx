import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/settings/settings")({
  component: RouteComponent
})

import { Settings } from "@better-auth-ui/shadcn"

function RouteComponent() {
  return (
    <div className="w-full mx-auto p-4 md:p-6">
      <Settings view="account" />
    </div>
  )
}
