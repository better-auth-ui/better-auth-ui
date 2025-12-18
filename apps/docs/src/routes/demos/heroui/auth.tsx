import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/auth")({
  component: RouteComponent
})

import { Auth } from "@better-auth-ui/heroui"

/**
 * Renders a centered authentication UI configured for sign-in with magic-link and social sign-in.
 *
 * @returns A JSX element containing a centered container that hosts the Auth component configured for the "signIn" view with magic link enabled and social providers ["github", "google"].
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <Auth view="signIn" magicLink socialProviders={["github", "google"]} />
    </div>
  )
}