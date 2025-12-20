import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/user-profile")({
  component: RouteComponent
})

import { UserProfile } from "@better-auth-ui/shadcn"

/**
 * Renders the page content for the user profile demo.
 *
 * @returns A JSX element containing the UserProfile component inside a responsive container.
 */
function RouteComponent() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <UserProfile />
    </div>
  )
}
