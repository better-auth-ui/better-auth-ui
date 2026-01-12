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
import { useHydrated } from "../../hooks/use-hydrated"

const fallbackQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000
    }
  }
})

const baseAuthConfig: AnyAuthConfig = {
  ...defaultConfig,
  Link: (props) => <a {...props} />
}

export type AuthProviderProps = PropsWithChildren<AnyAuthConfig> & {
  authClient: AnyAuthClient
  queryClient?: QueryClient
}

/**
 * Provides AuthConfig to descendant components.
 */
export function AuthProvider({
  children,
  queryClient,
  ...config
}: AuthProviderProps) {
  const queryClientContext = useContext(QueryClientContext)
  const resolvedQueryClient =
    queryClient || queryClientContext || fallbackQueryClient

  const mergedConfig = deepmerge(baseAuthConfig, config) as AuthConfig

  const hydrated = useHydrated()

  if (hydrated) {
    mergedConfig.redirectTo =
      new URLSearchParams(window.location.search).get("redirectTo")?.trim() ||
      mergedConfig.redirectTo
  }

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
 * Returns the `AuthContext` configuration
 *
 * @returns The `AuthContext`
 * @throws If the `AuthContext` is not provided
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("[Better Auth UI] AuthProvider is required")
  }

  return context
}
