import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/reset-password")({
  component: RouteComponent
})

import { ResetPassword } from "@better-auth-ui/heroui"

/**
 * Component for the "/demos/heroui/reset-password" demo route that renders the ResetPassword UI.
 *
 * @returns The JSX element for the route's UI.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <ResetPassword />
    </div>
  )
}
