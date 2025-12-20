import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/reset-password-registry")({
  component: RouteComponent
})

import { ResetPassword } from "@/components/auth/reset-password"

function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <ResetPassword />
    </div>
  )
}
