import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/sign-up-registry")({
  component: RouteComponent
})

import { SignUp } from "@/components/auth/sign-up"

function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <SignUp magicLink socialProviders={["github", "google"]} />
    </div>
  )
}
