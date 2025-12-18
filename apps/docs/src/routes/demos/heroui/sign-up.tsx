import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/sign-up")({
  component: RouteComponent
})

import { SignUp } from "@better-auth-ui/heroui"

/**
 * Renders a centered Heraoui SignUp demo configured with magic link and GitHub/Google social sign-in.
 *
 * @returns A JSX element containing a centered SignUp component with `magicLink` enabled and `socialProviders` set to `["github", "google"]`.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <SignUp magicLink socialProviders={["github", "google"]} />
    </div>
  )
}
