import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/user-profile")({
  component: RouteComponent
})

import { UserProfile } from "@better-auth-ui/heroui"

/**
 * Renders the demo page container that displays the `UserProfile` component.
 *
 * @returns A JSX element containing a responsive container div with the `UserProfile` component.
 */
function RouteComponent() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <UserProfile />
    </div>
  )
}
