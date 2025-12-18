import { createFileRoute, Outlet } from "@tanstack/react-router"

import herouiCss from "@/styles/shadcn.css?url"

export const Route = createFileRoute("/demos/shadcn")({
  component: RouteComponent,
  head: () => ({
    links: [{ rel: "stylesheet", href: herouiCss }]
  })
})

/**
 * Renders the route's nested content using an Outlet.
 *
 * @returns A React element that renders the matched child route via an `Outlet`.
 */
function RouteComponent() {
  return <Outlet />
}