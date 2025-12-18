import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/sign-out")({
  component: RouteComponent
})

import { SignOut } from "@better-auth-ui/heroui"

function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <SignOut />
    </div>
  )
}
