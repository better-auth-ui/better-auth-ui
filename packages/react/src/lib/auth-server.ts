import type { passkey } from "@better-auth/passkey"
import type { Auth } from "better-auth"
import type {
  magicLink,
  multiSession,
  organization,
  username
} from "better-auth/plugins"

export type AuthServer = Pick<Auth, "api">

// Per-plugin variants mirror the client-side types in `auth-client.ts` so
// server-side query factories can depend on a narrow `auth` shape that
// includes the plugin's API surface without requiring the full `betterAuth`
// return type to be threaded through as a generic.

export type OrganizationAuthServer = Pick<
  Auth<{ plugins: [ReturnType<typeof organization>] }>,
  "api"
>

export type MagicLinkAuthServer = Pick<
  Auth<{ plugins: [ReturnType<typeof magicLink>] }>,
  "api"
>

export type MultiSessionAuthServer = Pick<
  Auth<{ plugins: [ReturnType<typeof multiSession>] }>,
  "api"
>

export type PasskeyAuthServer = Pick<
  Auth<{ plugins: [ReturnType<typeof passkey>] }>,
  "api"
>

export type UsernameAuthServer = Pick<
  Auth<{ plugins: [ReturnType<typeof username>] }>,
  "api"
>
