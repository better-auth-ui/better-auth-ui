"use client"

import {
  type AdditionalField,
  type AuthConfig,
  type DeepPartial,
  deepmerge,
  defaultAuthConfig
} from "@better-auth-ui/core"
import {
  QueryClient,
  QueryClientContext,
  QueryClientProvider
} from "@tanstack/react-query"
import { type PropsWithChildren, type ReactNode, useContext } from "react"
import type { AuthClient } from "../../lib/auth-client"
import { MutationInvalidator } from "../mutation-invalidator"
import { AuthContext } from "./auth-context"
import { FetchOptionsProvider } from "./fetch-options-provider"

const fallbackQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000
    }
  }
})

declare module "@better-auth-ui/core" {
  interface AuthConfig {
    /**
     * The auth client to use for the authentication context.
     * @remarks `AuthClient`
     */
    authClient: AuthClient
  }

  /** Widen `AdditionalField.label` to `ReactNode` in the React package. */
  interface AdditionalFieldRegister {
    label: ReactNode
  }
}

export type AuthProviderProps<TAuthClient = AuthClient> = PropsWithChildren<
  DeepPartial<AuthConfig>
> & {
  authClient: TAuthClient
  navigate: (options: { to: string; replace?: boolean }) => void
  /** TanStack QueryClient to use for your application's queries */
  queryClient?: QueryClient
}

/**
 * Provides merged authentication configuration and a resolved React Query client to descendant components.
 *
 * The component merges the provided auth config with the library defaults,
 * resolves `redirectTo` from the current URL whenever it is read, wires a
 * QueryClient (prop, context, or fallback), and installs an error handler that
 * surfaces query errors via the configured toast. It then supplies the merged
 * config via AuthContext and wraps children with QueryClientProvider.
 *
 * @returns The children wrapped with AuthContext.Provider and QueryClientProvider configured for auth.
 */
export function AuthProvider({
  children,
  queryClient,
  ...config
}: AuthProviderProps) {
  const { authClient, ...partialConfig } = config
  const mergedConfig = {
    ...deepmerge<Omit<AuthConfig, "authClient">>(
      defaultAuthConfig,
      partialConfig
    ),
    authClient
  }
  const configuredRedirectTo = mergedConfig.redirectTo

  Object.defineProperty(mergedConfig, "redirectTo", {
    configurable: true,
    enumerable: true,
    get: () =>
      (typeof window !== "undefined" &&
        new URLSearchParams(window.location.search)
          .get("redirectTo")
          ?.trim()) ||
      configuredRedirectTo
  })

  // Merge plugin-contributed `additionalFields` with user-supplied ones.
  // Plugin order is preserved; user-supplied entries with the same `name`
  // override the plugin contribution.
  const fieldsByName = new Map<string, AdditionalField>()
  for (const plugin of mergedConfig.plugins ?? []) {
    for (const field of plugin.additionalFields ?? []) {
      fieldsByName.set(field.name, field)
    }
  }
  for (const field of mergedConfig.additionalFields ?? []) {
    fieldsByName.set(field.name, field)
  }
  mergedConfig.additionalFields = Array.from(fieldsByName.values())

  const contextQueryClient = useContext(QueryClientContext)

  return (
    <QueryClientProvider
      client={queryClient || contextQueryClient || fallbackQueryClient}
    >
      <AuthContext.Provider value={mergedConfig}>
        <FetchOptionsProvider>
          <MutationInvalidator />

          {children}
        </FetchOptionsProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  )
}

/**
 * Accesses the current authentication configuration from AuthContext.
 *
 * UI packages widen the plugin type globally via the `Register` interface
 * (see module augmentation in `@better-auth-ui/heroui`), so callers don't
 * need to pass a generic.
 *
 * @returns The merged authentication configuration provided by AuthProvider.
 * @throws If no AuthProvider is present in the component tree.
 */
export function useAuth(): AuthConfig {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("[Better Auth UI] AuthProvider is required")
  }

  return context
}
