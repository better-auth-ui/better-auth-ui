import { createFileRoute, Outlet } from "@tanstack/react-router"

import herouiCss from "@/styles/heroui.css?url"

export const Route = createFileRoute("/demos/heroui")({
  component: RouteComponent,
  head: () => ({
    links: [{ rel: "stylesheet", href: herouiCss }]
  })
})

/**
 * Renders a placeholder that displays the matched child route.
 *
 * @returns A React element that renders the matched child route via an `Outlet`.
 */
function RouteComponent() {
  return <Outlet />
}
