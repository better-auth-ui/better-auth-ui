import { deepmerge, defaultConfig } from "@better-auth-ui/core"
import {
  type AnyAuthConfig,
  type AuthConfig,
  AuthContext
} from "@better-auth-ui/react"
import { QueryClient, QueryClientContext } from "@tanstack/react-query"
import { useContext } from "react"

const queryClient = new QueryClient()

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
  const contextQueryClient = useContext(QueryClientContext)

  const authConfig = {
    queryClient: contextQueryClient || queryClient,
    ...deepmerge(
      deepmerge(defaultConfig as AnyAuthConfig, extendConfig),
      deepmerge(context || {}, config || {})
    )
  } as AuthConfig

  if (authConfig.authClient === undefined) {
    throw new Error("[Better Auth UI] authClient is required")
  }

  return authConfig
}
