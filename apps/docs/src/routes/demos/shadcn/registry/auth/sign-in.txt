import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/sign-in-registry")({
  component: RouteComponent
})

import { SignIn } from "@/components/auth/sign-in"

function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <SignIn magicLink socialProviders={["github", "google"]} />
    </div>
  )
}
