import type { AuthConfig as BaseAuthConfig } from "@better-auth-ui/react/core"
import type { DeepPartial } from "better-auth"
import type { ComponentType, PropsWithChildren } from "react"
import type { AnyAuthClient, AuthClient } from "./auth-client"

/**
 * Extends the base AuthConfig with React-specific requirements including
 * an authClient instance and a Link component for navigation.
 */
export type AuthConfig = BaseAuthConfig & {
  authClient: AuthClient
  /**
   * React component for rendering links
   * @remarks `LinkComponent`
   */
  Link: ComponentType<PropsWithChildren<{ className?: string; href: string }>>
}

/**
 * Partial AuthConfig with any Better Auth client instance.
 */
export type AnyAuthConfig = DeepPartial<Omit<AuthConfig, "authClient">> & {
  /**
   * Better Auth client instance
   * @remarks `AuthClient`
   */
  authClient?: AnyAuthClient
}
