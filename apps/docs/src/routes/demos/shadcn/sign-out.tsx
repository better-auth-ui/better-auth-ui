import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/sign-out")({
  component: RouteComponent
})

import { SignOut } from "@better-auth-ui/shadcn"

/**
 * Renders a centered layout that contains the SignOut component.
 *
 * @returns A JSX element: a div with layout and spacing classes wrapping the `SignOut` component.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <SignOut />
    </div>
  )
}