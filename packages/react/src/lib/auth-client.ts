import {
  magicLinkClient,
  multiSessionClient,
  usernameClient
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import type { AuthConfig } from "./auth-config"

/**
 * Type representing any auth client created with `createAuthClient`.
 *
 * Used for type flexibility when accepting auth clients that may have different
 * plugin configurations or feature sets.
 */
export type AnyAuthClient = Omit<ReturnType<typeof createAuthClient>, "signUp">

const authClient = createAuthClient({
  plugins: [magicLinkClient(), multiSessionClient(), usernameClient()]
})

/**
 * Type representing the default auth client with plugins enabled.
 *
 * This is the standard auth client type used throughout the React package
 * and includes all required plugins enabled.
 */

type ResolveAuthClient<T> = "AuthClient" extends keyof T
  ? T["AuthClient"]
  : typeof authClient

/**
 * The resolved auth client type, either from user augmentation or the default.
 */
export type AuthClient = ResolveAuthClient<AuthConfig>
