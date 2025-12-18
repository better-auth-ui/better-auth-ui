import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/sign-out")({
  component: RouteComponent
})

import { SignOut } from "@better-auth-ui/heroui"

/**
 * Renders a centered layout containing the SignOut component.
 *
 * @returns A JSX element that wraps the `SignOut` UI in a padded, vertically centered container.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <SignOut />
    </div>
  )
}