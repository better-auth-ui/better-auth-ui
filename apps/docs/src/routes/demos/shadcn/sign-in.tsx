import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/sign-in")({
  component: RouteComponent
})

import { SignIn } from "@better-auth-ui/shadcn"

/**
 * Renders the sign-in demo UI using the SignIn component configured with a magic link and GitHub/Google providers.
 *
 * @returns A JSX element containing a centered, padded container with the configured `SignIn` component.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <SignIn magicLink socialProviders={["github", "google"]} />
    </div>
  )
}
