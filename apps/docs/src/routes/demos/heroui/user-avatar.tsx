import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/user-avatar")({
  component: RouteComponent
})

import { UserAvatar } from "@better-auth-ui/heroui"

/**
 * Renders a centered demo view that displays the `UserAvatar` component.
 *
 * @returns A JSX element containing a centered `UserAvatar`.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <UserAvatar />
    </div>
  )
}
