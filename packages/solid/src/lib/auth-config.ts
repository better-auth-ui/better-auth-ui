import {
  type AuthConfig,
  type DeepPartial,
  deepmerge,
  defaultAuthConfig
} from "@better-auth-ui/core"
import type { AuthClient } from "./auth-client"
import { mergeAdditionalFields, resolveRedirectTo } from "./auth-utils"

declare module "@better-auth-ui/core" {
  interface AuthConfig {
    /** The Solid Better Auth client used by auth context consumers. */
    authClient: AuthClient
  }
}

export type SolidAuthConfigInput<TAuthClient = AuthClient> =
  DeepPartial<AuthConfig> & {
    authClient: TAuthClient
  }

export function resolveAuthConfig(
  config: SolidAuthConfigInput<AuthClient>
): AuthConfig {
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
  } as AuthConfig)
  const configuredRedirectTo = mergedConfig.redirectTo

  Object.defineProperty(mergedConfig, "redirectTo", {
    configurable: true,
    enumerable: true,
    get: () => resolveRedirectTo(configuredRedirectTo)
  })
  mergedConfig.additionalFields = mergeAdditionalFields(
    mergedConfig.plugins?.flatMap((plugin) => plugin.additionalFields ?? []),
    mergedConfig.additionalFields
  )

  return mergedConfig as AuthConfig
}
