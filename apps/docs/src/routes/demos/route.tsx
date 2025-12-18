import { createFileRoute, Outlet } from "@tanstack/react-router"
import { DemoProviders } from "@/components/demo-providers"

export const Route = createFileRoute("/demos")({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <DemoProviders>
      <Outlet />
    </DemoProviders>
  )
}
