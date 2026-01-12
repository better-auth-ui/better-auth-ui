import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/auth/auth")({
  component: RouteComponent
})

import { Auth } from "@better-auth-ui/shadcn"

/**
 * Renders a centered sign-in view using the `Auth` component.
 *
 * @returns A JSX element containing a vertically centered container with the `Auth` component configured for the "signIn" view.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <Auth view="signIn" />
    </div>
  )
}