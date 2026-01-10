import { deepmerge, defaultConfig } from "@better-auth-ui/core"
import {
  type AnyAuthConfig,
  type AuthConfig,
  AuthContext
} from "@better-auth-ui/react"
import { QueryClient, QueryClientContext } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { useContext, useEffect } from "react"

const fallbackQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000
    }
  }
})

const extendConfig: AnyAuthConfig = {
  Link: (props) => <a {...props} />
}

/**
 * Constructs the effective AuthConfig by merging defaults, any AuthContext-provided config, and the optional `config` overrides.
 *
 * @param config - Partial configuration overrides applied on top of context and defaults
 * @returns The final `AuthConfig` with a non-optional `authClient`
 * @throws If the resulting config does not include an `authClient`
 */
export function useAuth(config?: AnyAuthConfig) {
  const context = useContext(AuthContext)

  const queryClient = useContext(QueryClientContext) || fallbackQueryClient
  queryClient.mount()

  const authConfig = {
    queryClient,
    ...deepmerge(
      deepmerge(defaultConfig as AnyAuthConfig, extendConfig),
      deepmerge(context || {}, config || {})
    )
  } as AuthConfig

  if (typeof window !== "undefined") {
    authConfig.redirectTo =
      new URLSearchParams(window.location.search).get("redirectTo")?.trim() ||
      authConfig.redirectTo
  }

  useEffect(() => {
    queryClient.getQueryCache().config.onError = (error) => {
      authConfig.toast.error(
        error.message || (error as BetterFetchError).statusText
      )
    }
  }, [queryClient, authConfig.toast.error])

  if (authConfig.authClient === undefined) {
    throw new Error("[Better Auth UI] authClient is required")
  }

  return authConfig
}
