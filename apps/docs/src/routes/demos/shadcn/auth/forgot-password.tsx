import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/auth/forgot-password")({
  component: RouteComponent
})

import { ForgotPassword } from "@better-auth-ui/shadcn"

function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <ForgotPassword />
    </div>
  )
}
