import { createFileRoute } from "@tanstack/solid-router"

import { authHandler } from "@/lib/auth"

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => authHandler(request),
      POST: ({ request }) => authHandler(request)
    }
  }
})
