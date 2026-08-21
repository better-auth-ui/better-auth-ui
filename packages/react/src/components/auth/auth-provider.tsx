"use client"

import {
  type AuthClient,
  type AuthConfig,
  type AuthConfigOptions,
  authQueryKeys,
  createAuthQueryRetryOptions,
  resolveAuthConfig
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
  useMemo,
  useRef
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

function useShallowStableObject<T extends object>(value: T): T {
  const reference = useRef(value)
  const previousKeys = Object.keys(reference.current)
  const nextKeys = Object.keys(value)
  const isStable =
    previousKeys.length === nextKeys.length &&
    nextKeys.every((key) =>
      Object.is(reference.current[key as keyof T], value[key as keyof T])
    )

  if (!isStable) reference.current = value

  return reference.current
}

declare module "@better-auth-ui/core" {
  /** Widen `AdditionalField.label` to `ReactNode` in the React package. */
  interface AdditionalFieldRegister {
    label: ReactNode
  }

  /** Custom social provider icons can be SVG components or rendered nodes. */
  interface SocialProviderRegister {
    icon: ReactNode
  }
}

export type AuthProviderProps<TAuthClient extends AuthClient = AuthClient> =
  PropsWithChildren<
    Omit<AuthConfigOptions<TAuthClient>, "navigate"> & {
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
  const stableConfig = useShallowStableObject(config)
  const mergedConfig = useMemo(() => {
    const { authClient, ...partialConfig } = stableConfig
    const resolvedConfig = resolveAuthConfig({
      ...partialConfig,
      authClient
    }) as AuthConfig<TAuthClient>
    const configuredRedirectTo = resolvedConfig.redirectTo

    Object.defineProperty(resolvedConfig, "redirectTo", {
      configurable: true,
      enumerable: true,
      get: () =>
        (typeof window !== "undefined" &&
          new URLSearchParams(window.location.search)
            .get("redirectTo")
            ?.trim()) ||
        configuredRedirectTo
    })

    return resolvedConfig
  }, [stableConfig])

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
