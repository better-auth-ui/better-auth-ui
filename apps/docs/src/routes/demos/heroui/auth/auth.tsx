import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/auth/auth")({
  component: RouteComponent
})

import { Auth } from "@better-auth-ui/heroui"

/**
 * Renders a centered authentication UI showing the sign-in view.
 *
 * @returns A JSX element containing a vertically centered container that hosts the `Auth` component with `view="signIn"`.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <Auth view="signIn" />
    </div>
  )
}