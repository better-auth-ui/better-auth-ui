import { QueryClient } from "@tanstack/solid-query"
import { createRouter } from "@tanstack/solid-router"

import { routeTree } from "./routeTree.gen"

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000
      }
    }
  })

  return createRouter({
    context: { queryClient },
    defaultPreloadStaleTime: 0,
    routeTree,
    scrollRestoration: true
  })
}

declare module "@tanstack/solid-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
