"use client"

import { deepmerge, defaultConfig } from "@better-auth-ui/core"
import {
  type AnyAuthClient,
  type AnyAuthConfig,
  type AuthConfig,
  AuthContext
} from "@better-auth-ui/react"
import {
  QueryClient,
  QueryClientContext,
  QueryClientProvider
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { type PropsWithChildren, useContext, useEffect } from "react"

const fallbackQueryClient = new QueryClient()

const baseAuthConfig: AnyAuthConfig = {
  ...defaultConfig,
  Link: (props) => <a {...props} />
}

export type AuthProviderProps = PropsWithChildren<AnyAuthConfig> & {
  authClient: AnyAuthClient
  queryClient?: QueryClient
}

/**
 * Provides merged authentication configuration and a resolved React Query client to descendant components.
 *
 * The component merges the provided auth config with the library defaults, updates `redirectTo` from the
 * current URL when the app is hydrated, wires a QueryClient (prop, context, or fallback) and installs an
 * error handler that surfaces query errors via the configured toast. It then supplies the merged config
 * via AuthContext and wraps children with QueryClientProvider.
 *
 * @returns The children wrapped with AuthContext.Provider and QueryClientProvider configured for auth.
 */
export function AuthProvider({
  children,
  queryClient,
  ...config
}: AuthProviderProps) {
  const contextQueryClient = useContext(QueryClientContext)
  const resolvedQueryClient =
    queryClient || contextQueryClient || fallbackQueryClient

  const mergedConfig = deepmerge(baseAuthConfig, config) as AuthConfig

  mergedConfig.redirectTo =
    (typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("redirectTo")?.trim()) ||
    mergedConfig.redirectTo

  useEffect(() => {
    resolvedQueryClient.getQueryCache().config.onError = (error) => {
      mergedConfig.toast.error(
        error.message || (error as BetterFetchError).statusText
      )
    }
  }, [resolvedQueryClient, mergedConfig.toast.error])

  return (
    <AuthContext.Provider value={mergedConfig}>
      <QueryClientProvider client={resolvedQueryClient}>
        {children}
      </QueryClientProvider>
    </AuthContext.Provider>
  )
}

/**
 * Accesses the current authentication configuration from AuthContext.
 *
 * @returns The merged authentication configuration provided by AuthProvider.
 * @throws If no AuthProvider is present in the component tree.
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("[Better Auth UI] AuthProvider is required")
  }

  return context
}
