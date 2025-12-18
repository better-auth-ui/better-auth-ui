import { createFileRoute, Outlet } from "@tanstack/react-router"
import appCss from "@/styles/app.css?url"

export const Route = createFileRoute("/docs")({
  head: () => ({
    links: [{ rel: "stylesheet", href: appCss }]
  }),
  component: RouteComponent
})

function RouteComponent() {
  return <Outlet />
}
