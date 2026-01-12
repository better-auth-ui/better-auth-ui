import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/auth/magic-link")({
  component: RouteComponent
})

import { MagicLink } from "@better-auth-ui/heroui"

/**
 * Render the demo route UI that displays the MagicLink component centered with padding.
 *
 * @returns A JSX element containing a centered, padded container that renders the `MagicLink` component.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <MagicLink />
    </div>
  )
}