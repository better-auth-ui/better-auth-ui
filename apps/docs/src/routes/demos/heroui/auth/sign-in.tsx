import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/auth/sign-in")({
  component: RouteComponent
})

import { SignIn } from "@better-auth-ui/heroui"

/**
 * Render a centered, padded container that hosts the SignIn UI.
 *
 * @returns A JSX element containing a vertically stacked, padded div centered on the page with the `SignIn` component inside.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <SignIn />
    </div>
  )
}