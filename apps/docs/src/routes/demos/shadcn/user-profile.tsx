import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/user-profile")({
  component: RouteComponent
})

import { UserProfile } from "@better-auth-ui/shadcn"

function RouteComponent() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <UserProfile />
    </div>
  )
}
