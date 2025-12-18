"use client"

import type { AnyAuthClient, AnyAuthConfig } from "@better-auth-ui/react"
import { createContext, type PropsWithChildren } from "react"

export const AuthContext = createContext<AnyAuthConfig | undefined>(undefined)

export type AuthProviderProps = PropsWithChildren<AnyAuthConfig> & {
  authClient: AnyAuthClient
}

/**
 * Provides AuthConfig to descendant components.
 */
export function AuthProvider({ children, ...config }: AuthProviderProps) {
  return <AuthContext.Provider value={config}>{children}</AuthContext.Provider>
}
