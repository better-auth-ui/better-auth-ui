import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/user/user-button")({
  component: RouteComponent
})

import { UserButton } from "@better-auth-ui/heroui"

function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 items-center">
      <UserButton />
    </div>
  )
}
