import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  fetchOptions: {
    customFetchImpl: async () => new Response()
  }
})
