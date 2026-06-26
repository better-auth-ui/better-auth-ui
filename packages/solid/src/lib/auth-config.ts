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

export type SolidAuthConfig<TAuthClient extends AuthClient = AuthClient> = Omit<
  AuthConfig,
  "authClient"
> & {
  authClient: TAuthClient
}

export type SolidAuthConfigInput<TAuthClient extends AuthClient = AuthClient> =
  DeepPartial<Omit<AuthConfig, "authClient">> & {
    authClient: TAuthClient
  }

export function resolveAuthConfig<TAuthClient extends AuthClient>(
  config: SolidAuthConfigInput<TAuthClient>
): SolidAuthConfig<TAuthClient> {
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
  } as SolidAuthConfig<TAuthClient>)

  mergedConfig.redirectTo = resolveRedirectTo(mergedConfig.redirectTo)
  mergedConfig.additionalFields = mergeAdditionalFields(
    mergedConfig.plugins?.flatMap((plugin) => plugin.additionalFields ?? []),
    mergedConfig.additionalFields
  )

  return mergedConfig as SolidAuthConfig<TAuthClient>
}
