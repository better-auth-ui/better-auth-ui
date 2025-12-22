import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/demos/shadcn/settings/account/accounts"
)({
  component: RouteComponent
})

import { Accounts } from "@better-auth-ui/shadcn"

function RouteComponent() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <Accounts />
    </div>
  )
}

