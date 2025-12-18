import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/forgot-password")({
  component: RouteComponent
})

import { ForgotPassword } from "@better-auth-ui/shadcn"

/**
 * Renders the ForgotPassword UI inside a centered, responsive container.
 *
 * @returns A React element containing the forgot password form wrapped in a styled div.
 */
function RouteComponent() {
  return (
    <div className="flex flex-col p-4 md:p-6 my-auto items-center">
      <ForgotPassword />
    </div>
  )
}
