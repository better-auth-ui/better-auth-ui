import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/auth/sign-in")({
  component: RouteComponent
})

import { SignIn } from "@better-auth-ui/shadcn"

/**
 * Renders the sign-in demo page for the shadcn auth UI.
 *
 * @returns A JSX element containing a centered container that renders the `SignIn` component with responsive padding.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <SignIn />
    </div>
  )
}