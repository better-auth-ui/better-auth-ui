"use client"

import { apiKeyClient } from "@better-auth/api-key/client"
import { passkeyClient } from "@better-auth/passkey/client"
import {
  inferAdditionalFields,
  magicLinkClient,
  multiSessionClient,
  organizationClient,
  usernameClient
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import type { auth } from "./auth"

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    multiSessionClient(),
    apiKeyClient(),
    passkeyClient(),
    usernameClient(),
    organizationClient(),
    magicLinkClient()
  ]
})
