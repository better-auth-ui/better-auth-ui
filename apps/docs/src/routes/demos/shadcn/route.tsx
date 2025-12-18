import { createFileRoute, Outlet } from "@tanstack/react-router"

import herouiCss from "@/styles/shadcn.css?url"

export const Route = createFileRoute("/demos/shadcn")({
  component: RouteComponent,
  head: () => ({
    links: [{ rel: "stylesheet", href: herouiCss }]
  })
})

function RouteComponent() {
  return <Outlet />
}
