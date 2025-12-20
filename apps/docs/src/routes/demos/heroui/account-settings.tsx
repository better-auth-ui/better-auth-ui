import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demos/heroui/account-settings")({
  component: RouteComponent
})

import { AccountSettings } from "@better-auth-ui/heroui"

/**
 * Renders the AccountSettings demo inside a responsive container.
 *
 * @returns A JSX element containing the `AccountSettings` component wrapped in a centered, padded container.
 */
function RouteComponent() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <AccountSettings />
    </div>
  )
}
