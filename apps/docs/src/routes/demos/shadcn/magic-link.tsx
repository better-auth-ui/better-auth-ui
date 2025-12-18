import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/magic-link")({
  component: RouteComponent
})

import { MagicLink } from "@better-auth-ui/shadcn"

/**
 * Renders a centered layout containing a MagicLink authentication component configured for GitHub and Google.
 *
 * @returns The React element for the centered MagicLink demo with `socialProviders` set to `["github", "google"]`.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <MagicLink socialProviders={["github", "google"]} />
    </div>
  )
}
