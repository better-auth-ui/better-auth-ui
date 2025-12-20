import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify({ message: "Demo" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }),
      POST: () =>
        new Response(JSON.stringify({ message: "Demo" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        })
    }
  }
})
