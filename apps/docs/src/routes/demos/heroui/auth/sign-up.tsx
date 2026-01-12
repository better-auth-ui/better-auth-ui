import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/auth/sign-up")({
  component: RouteComponent
})

import { SignUp } from "@better-auth-ui/heroui"

/**
 * Renders the sign-up demo page using the `SignUp` component.
 *
 * @returns A JSX element containing the sign-up UI wrapped in a centered, padded container.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <SignUp />
    </div>
  )
}
