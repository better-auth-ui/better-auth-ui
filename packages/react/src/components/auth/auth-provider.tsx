"use client"

import {
  type AnyAuthClient,
  type AnyAuthConfig,
  AuthContext
} from "@better-auth-ui/react"
import type { PropsWithChildren } from "react"

export type AuthProviderProps = PropsWithChildren<AnyAuthConfig> & {
  authClient: AnyAuthClient
}

/**
 * Provides AuthConfig to descendant components.
 */
export function AuthProvider({ children, ...config }: AuthProviderProps) {
  return <AuthContext.Provider value={config}>{children}</AuthContext.Provider>
}
