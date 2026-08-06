"use client"

import {
  type AdditionalField,
  type AuthClient,
  type AuthConfig,
  authQueryKeys,
  createAuthQueryRetryOptions,
  type DeepPartial,
  deepmerge,
  defaultAuthConfig
} from "@better-auth-ui/core"
import {
  environmentManager,
  QueryClient,
  QueryClientContext,
  QueryClientProvider
} from "@tanstack/react-query"
import {
  type PropsWithChildren,
  type ReactNode,
  useContext,
  useMemo
} from "react"
import { MutationInvalidator } from "../mutation-invalidator"
import { AuthContext } from "./auth-context"
import { FetchOptionsProvider } from "./fetch-options-provider"

const authQueryRetryOptions = createAuthQueryRetryOptions(() =>
  environmentManager.isServer()
)

const fallbackQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000
    }
  }
})

declare module "@better-auth-ui/core" {
  /** Widen `AdditionalField.label` to `ReactNode` in the React package. */
  interface AdditionalFieldRegister {
    label: ReactNode
  }
}

export type AuthProviderProps<TAuthClient extends AuthClient = AuthClient> =
  PropsWithChildren<
    DeepPartial<Omit<AuthConfig, "authClient">> & {
      authClient: TAuthClient
      navigate: (options: { to: string; replace?: boolean }) => void
      /** TanStack QueryClient to use for your application's queries */
      queryClient?: QueryClient
    }
  >

/**
 * Provides merged authentication configuration and a resolved React Query client to descendant components.
 *
 * The component merges the provided auth config with the library defaults,
 * resolves `redirectTo` from the current URL whenever it is read, wires a
 * QueryClient (prop, context, or fallback), applies retry defaults for auth
 * queries, and installs an error handler that surfaces query errors via the
 * configured toast. It then supplies the merged config via AuthContext and
 * wraps children with QueryClientProvider.
 *
 * @returns The children wrapped with AuthContext.Provider and QueryClientProvider configured for auth.
 */
export function AuthProvider<TAuthClient extends AuthClient = AuthClient>({
  children,
  queryClient,
  ...config
}: AuthProviderProps<TAuthClient>) {
  const { authClient, ...partialConfig } = config
  const mergedConfig = {
    ...deepmerge(defaultAuthConfig, partialConfig),
    authClient
  } as AuthConfig<TAuthClient>
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
  const resolvedQueryClient =
    queryClient ?? contextQueryClient ?? fallbackQueryClient

  const configuredQueryClient = useMemo(() => {
    // Descendant queries resolve their defaults during render, so this
    // idempotent initialization must happen before they render.
    resolvedQueryClient.setQueryDefaults(
      authQueryKeys.all,
      authQueryRetryOptions
    )

    return resolvedQueryClient
  }, [resolvedQueryClient])

  return (
    <QueryClientProvider client={configuredQueryClient}>
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
export function useAuth<TAuthClient extends AuthClient = AuthClient>() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("[Better Auth UI] AuthProvider is required")
  }

  return context as AuthConfig<TAuthClient>
}
