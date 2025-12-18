import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/sign-up")({
  component: RouteComponent
})

import { SignUp } from "@better-auth-ui/heroui"

function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <SignUp magicLink socialProviders={["github", "google"]} />
    </div>
  )
}
