import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/auth/sign-up")({
  component: RouteComponent
})

import { SignUp } from "@better-auth-ui/shadcn"

/**
 * Renders a centered sign-up view using the shadcn `SignUp` component.
 *
 * @returns The JSX element containing a vertically centered container that displays the sign-up UI.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <SignUp />
    </div>
  )
}
