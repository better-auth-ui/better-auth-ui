import { apiKeyClient } from "@better-auth/api-key/client"
import { passkeyClient } from "@better-auth/passkey/client"
import type { AuthClient } from "@better-auth-ui/core"
import { createAuthClient } from "@better-auth-ui/solid"
import {
  magicLinkClient,
  multiSessionClient,
  organizationClient,
  usernameClient
} from "better-auth/client/plugins"

const resolveAuthBaseURL = () => {
  if (import.meta.env.VITE_AUTH_URL) return import.meta.env.VITE_AUTH_URL

  if (import.meta.env.SSR) return "http://localhost:5173/api/auth"

  return `${window.location.origin}/api/auth`
}

const authBaseURL = resolveAuthBaseURL()

export const authClient: AuthClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [
    multiSessionClient(),
    apiKeyClient(),
    passkeyClient(),
    usernameClient(),
    magicLinkClient(),
    organizationClient()
  ]
})
