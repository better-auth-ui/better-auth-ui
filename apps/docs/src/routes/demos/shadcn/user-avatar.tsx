import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/user-avatar")({
  component: RouteComponent
})

import { UserAvatar } from "@better-auth-ui/shadcn"

/**
 * Renders a centered UserAvatar inside a vertically stacked, padded container.
 *
 * @returns A JSX element containing the centered UserAvatar wrapped in a flex column container with responsive padding.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <UserAvatar />
    </div>
  )
}
