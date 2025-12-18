"use client"

import type { AnyAuthClient, AnyAuthConfig } from "@better-auth-ui/react"
import { createContext, type PropsWithChildren } from "react"

export const AuthContext = createContext<AnyAuthConfig | undefined>(undefined)

export type AuthProviderProps = PropsWithChildren<AnyAuthConfig> & {
  authClient: AnyAuthClient
}

/**
 * Provides authentication configuration to descendant components via AuthContext.
 *
 * @param children - Elements to be rendered inside the provider.
 * @param config - Authentication configuration (including `authClient`) supplied to the context.
 * @returns A React element rendering AuthContext.Provider with the provided configuration.
 */
export function AuthProvider({ children, ...config }: AuthProviderProps) {
  return <AuthContext.Provider value={config}>{children}</AuthContext.Provider>
}