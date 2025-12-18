import {
  type AnyAuthConfig,
  type AuthConfig,
  AuthContext
} from "@better-auth-ui/react"
import { deepmerge, defaultConfig } from "@better-auth-ui/react/core"
import { useContext } from "react"
import { toast } from "sonner"

const extendConfig: AnyAuthConfig = {
  toast,
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

  const authConfig = deepmerge(
    deepmerge(defaultConfig as AnyAuthConfig, extendConfig),
    deepmerge(context || {}, config || {})
  ) as AuthConfig

  if (authConfig.authClient === undefined) {
    throw new Error("[Better Auth UI] authClient is required")
  }

  return authConfig
}
