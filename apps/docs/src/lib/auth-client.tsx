import { createAuthClient } from "better-auth/react"

const customFetchImpl: typeof fetch = async (input, _init) => {
  const endpoint = (input as URL).pathname

  if (endpoint === "/api/auth/get-session") {
    return new Response(
      JSON.stringify({
        session: {
          id: "123",
          userId: "123",
          expiresAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        user: {
          id: "123",
          name: "daveycodez",
          email: "daveycodez@example.com",
          emailVerified: true,
          image: "/avatars/daveycodez.png",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    )
  }

  if (endpoint === "/api/auth/multi-session/list-device-sessions") {
    return new Response(
      JSON.stringify([
        {
          session: {
            id: "123",
            userId: "123",
            expiresAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          user: {
            id: "123",
            name: "daveycodez",
            email: "daveycodez@example.com",
            emailVerified: true,
            image: "/avatars/daveycodez.png",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        {
          session: {
            id: "456",
            userId: "456",
            expiresAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          user: {
            id: "456",
            name: "John Doe",
            email: "john.doe@example.com",
            emailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      ]),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }

  return new Response(JSON.stringify({ message: "Demo" }), {
    status: 400,
    headers: { "Content-Type": "application/json" }
  })
}

export const authClient = createAuthClient({
  fetchOptions: {
    customFetchImpl
  }
})
