import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/magic-link")({
  component: RouteComponent
})

import { MagicLink } from "@better-auth-ui/heroui"

/**
 * Render a centered demo page that displays a MagicLink configured for GitHub and Google sign-in.
 *
 * @returns A React element containing a vertically stacked, centered container with a MagicLink using the `github` and `google` social providers.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <MagicLink socialProviders={["github", "google"]} />
    </div>
  )
}
