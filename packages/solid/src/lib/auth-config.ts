import {
  type AuthClient,
  type AuthConfig,
  type AuthConfigOptions,
  resolveAuthConfig as resolveCoreAuthConfig
} from "@better-auth-ui/core"
import { resolveRedirectTo } from "./auth-utils"

export function resolveAuthConfig<TAuthClient extends AuthClient>(
  config: AuthConfigOptions<TAuthClient>
): AuthConfig<TAuthClient> {
  const mergedConfig = resolveCoreAuthConfig(config)
  const configuredRedirectTo = mergedConfig.redirectTo

  Object.defineProperty(mergedConfig, "redirectTo", {
    configurable: true,
    enumerable: true,
    get: () => resolveRedirectTo(configuredRedirectTo)
  })
  return mergedConfig
}
