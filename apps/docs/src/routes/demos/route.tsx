import { createFileRoute, Outlet } from "@tanstack/react-router"
import { DemoProviders } from "@/components/demo-providers"

export const Route = createFileRoute("/demos")({
  component: RouteComponent
})

/**
 * Renders the route UI for demos, providing the DemoProviders context to nested routes.
 *
 * @returns A React element that wraps an <Outlet /> with <DemoProviders />, supplying the demo context to child routes.
 */
function RouteComponent() {
  return (
    <DemoProviders>
      <Outlet />
    </DemoProviders>
  )
}
