import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { NotFound } from "@/components/not-found"
import { routeTree } from "./routeTree.gen"

/**
 * Create a TanStack Router configured for the application.
 *
 * @returns A TanStack Router instance using the generated `routeTree`, `defaultPreload` set to `"intent"`, `scrollRestoration` enabled, and `NotFound` as the default not-found component.
 */
export function getRouter() {
  return createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound
  })
}