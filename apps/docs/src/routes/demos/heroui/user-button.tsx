import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/user-button")({
  component: RouteComponent
})

import { UserButton } from "@better-auth-ui/heroui"

/**
 * Renders the demo route UI containing a centered UserButton.
 *
 * @returns The React element that displays a padded, vertically centered container with a `UserButton`.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <UserButton />
    </div>
  )
}