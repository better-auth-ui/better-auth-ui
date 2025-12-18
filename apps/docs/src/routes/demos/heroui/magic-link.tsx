import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/magic-link")({
  component: RouteComponent
})

import { MagicLink } from "@better-auth-ui/heroui"

function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <MagicLink socialProviders={["github", "google"]} />
    </div>
  )
}
