import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/user/user-view")({
  component: RouteComponent
})

import { UserView } from "@better-auth-ui/heroui"

function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <UserView />
    </div>
  )
}
