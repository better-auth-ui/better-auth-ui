import { passkeyClient } from "@better-auth/passkey/client"
import {
    anonymousClient,
    apiKeyClient,
    emailOTPClient,
    genericOAuthClient,
    magicLinkClient,
    multiSessionClient,
    oneTapClient,
    organizationClient,
    twoFactorClient,
    usernameClient
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    // Provide a placeholder baseURL to prevent errors in non-HTTP environments
    // (e.g., Tauri, Electron where window.location.origin is tauri:// or file://)
    // This client is only used for type inference and should not be used at runtime.
    // See: https://github.com/better-auth-ui/better-auth-ui/issues/313
    baseURL: "http://localhost",
    plugins: [
        apiKeyClient(),
        multiSessionClient(),
        passkeyClient(),
        oneTapClient({
            clientId: ""
        }),
        genericOAuthClient(),
        anonymousClient(),
        usernameClient(),
        magicLinkClient(),
        emailOTPClient(),
        twoFactorClient(),
        organizationClient({
            teams: {
                enabled: true
            }
        })
    ]
})

export type AuthClient = typeof authClient

export type Session = AuthClient["$Infer"]["Session"]["session"]
export type User = AuthClient["$Infer"]["Session"]["user"]
