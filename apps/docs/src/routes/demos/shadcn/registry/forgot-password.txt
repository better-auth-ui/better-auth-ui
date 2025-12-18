import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/forgot-password-registry")({
  component: RouteComponent
})

import { ForgotPassword } from "@/components/auth/forgot-password"

function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <ForgotPassword />
    </div>
  )
}
