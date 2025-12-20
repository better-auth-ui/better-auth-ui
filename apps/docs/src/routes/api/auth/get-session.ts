import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/auth/get-session")({
  server: {
    handlers: {
      GET: () =>
        new Response(
          JSON.stringify({
            session: {
              id: "123",
              userId: "123",
              createdAt: new Date(),
              updatedAt: new Date(),
              expiresAt: new Date(),
              token: "example-token"
            },
            user: {
              id: "123",
              name: "daveycodez",
              email: "daveycodez@example.com",
              createdAt: new Date(),
              updatedAt: new Date(),
              emailVerified: true,
              image: "/avatars/daveycodez.png"
            }
          })
        )
    }
  }
})
