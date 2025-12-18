import { magicLinkClient, usernameClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

/**
 * Type representing any auth client created with `createAuthClient`.
 *
 * Used for type flexibility when accepting auth clients that may have different
 * plugin configurations or feature sets.
 */
export type AnyAuthClient = ReturnType<typeof createAuthClient>

const authClient = createAuthClient({
  plugins: [magicLinkClient(), usernameClient()]
})

/**
 * Type representing the default auth client with plugins enabled.
 *
 * This is the standard auth client type used throughout the React package
 * and includes all required plugins enabled.
 */
export type AuthClient = typeof authClient
