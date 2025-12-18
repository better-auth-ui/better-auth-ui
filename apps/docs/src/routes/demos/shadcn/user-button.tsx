import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/user-button")({
  component: RouteComponent
})

import { UserButton } from "@better-auth-ui/shadcn"

/**
 * Renders a centered vertical container that displays the `UserButton` component.
 *
 * @returns A React element containing a padded, centered column with the `UserButton`.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <UserButton />
    </div>
  )
}