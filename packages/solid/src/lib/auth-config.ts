import type { AuthClient } from "@better-auth-ui/core"
import {
  type AuthConfig,
  type DeepPartial,
  deepmerge,
  defaultAuthConfig
} from "@better-auth-ui/core"
import { mergeAdditionalFields, resolveRedirectTo } from "./auth-utils"

export function resolveAuthConfig<TAuthClient extends AuthClient>(
  config: DeepPartial<Omit<AuthConfig, "authClient">> & {
    authClient: TAuthClient
  }
): AuthConfig<TAuthClient> {
  const mergedConfig = deepmerge(defaultAuthConfig, {
    ...config,
    viewPaths: {
      auth: {
        ...defaultAuthConfig.viewPaths.auth,
        ...config.viewPaths?.auth
      },
      settings: {
        ...defaultAuthConfig.viewPaths.settings,
        ...config.viewPaths?.settings
      }
    }
  } as AuthConfig<TAuthClient>)

  mergedConfig.redirectTo = resolveRedirectTo(mergedConfig.redirectTo)
  mergedConfig.additionalFields = mergeAdditionalFields(
    mergedConfig.plugins?.flatMap((plugin) => plugin.additionalFields ?? []),
    mergedConfig.additionalFields
  )

  return mergedConfig as AuthConfig<TAuthClient>
}
