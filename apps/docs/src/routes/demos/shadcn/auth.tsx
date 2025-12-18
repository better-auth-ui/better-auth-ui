import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/auth")({
  component: RouteComponent
})

import { Auth } from "@better-auth-ui/shadcn"

/**
 * Renders a centered vertical container that displays the sign-in Auth UI.
 *
 * @returns A div containing the Auth component configured for the "signIn" view with magic link enabled and social providers `["github", "google"]`.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <Auth view="signIn" magicLink socialProviders={["github", "google"]} />
    </div>
  )
}