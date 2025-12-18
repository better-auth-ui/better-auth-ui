import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/sign-up")({
  component: RouteComponent
})

import { SignUp } from "@better-auth-ui/shadcn"

/**
 * Renders a centered sign-up demo that displays the shadcn `SignUp` UI configured for magic-link and GitHub/Google social authentication.
 *
 * @returns A React element containing a centered container with the `SignUp` component configured for magic link flow and `github`/`google` social providers.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <SignUp magicLink socialProviders={["github", "google"]} />
    </div>
  )
}
