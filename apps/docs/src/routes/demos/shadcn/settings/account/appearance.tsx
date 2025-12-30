import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/demos/shadcn/settings/account/appearance"
)({
  component: RouteComponent
})

import { Appearance } from "@better-auth-ui/shadcn"

function RouteComponent() {
  return (
    <div className="container mx-auto my-auto p-4 md:p-6">
      <Appearance />
    </div>
  )
}
