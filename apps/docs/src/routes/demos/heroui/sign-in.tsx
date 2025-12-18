import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/sign-in")({
  component: RouteComponent
})

import { SignIn } from "@better-auth-ui/heroui"

/**
 * Render a centered sign-in view using the Hiro UI SignIn component.
 *
 * @returns A JSX element containing a centered, padded container with the `SignIn` component configured for magic-link authentication and the social providers `github` and `google`.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <SignIn magicLink socialProviders={["github", "google"]} />
    </div>
  )
}
