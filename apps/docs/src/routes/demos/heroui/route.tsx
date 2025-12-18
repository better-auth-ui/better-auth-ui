import { createFileRoute, Outlet } from "@tanstack/react-router"

import herouiCss from "@/styles/heroui.css?url"

export const Route = createFileRoute("/demos/heroui")({
  component: RouteComponent,
  head: () => ({
    links: [{ rel: "stylesheet", href: herouiCss }]
  })
})

function RouteComponent() {
  return <Outlet />
}
