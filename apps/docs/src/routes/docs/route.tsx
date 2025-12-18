import { createFileRoute, Outlet } from "@tanstack/react-router"
import appCss from "@/styles/app.css?url"

export const Route = createFileRoute("/docs")({
  head: () => ({
    links: [{ rel: "stylesheet", href: appCss }]
  }),
  component: RouteComponent
})

/**
 * Renders the route's outlet for nested child routes.
 *
 * @returns A JSX element that renders nested child routes via an `Outlet`.
 */
function RouteComponent() {
  return <Outlet />
}
