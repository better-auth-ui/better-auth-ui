import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/shadcn/account-settings")({
  component: RouteComponent
})

import { AccountSettings } from "@better-auth-ui/shadcn"

/**
 * Renders the AccountSettings demo inside a centered, responsive container.
 *
 * @returns A JSX element that wraps the `AccountSettings` component in a styled container.
 */
function RouteComponent() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <AccountSettings />
    </div>
  )
}
