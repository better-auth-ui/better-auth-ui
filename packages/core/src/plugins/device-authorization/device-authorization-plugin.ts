import { createAuthPlugin } from "../../lib/create-auth-plugin"
// Side-effect import so this file participates in declaration merging on the
// same module instance that external consumers reach via `@better-auth-ui/core`.
import type {} from "../../lib/view-paths"
import {
  type DeviceAuthorizationLocalization,
  deviceAuthorizationLocalization
} from "./device-authorization-localization"

declare module "../../lib/view-paths" {
  /** Widens `AuthViewPaths` with the device-authorization path when this plugin is imported. */
  interface AuthViewPaths {
    /** @default "device" */
    deviceAuthorization?: string
  }
}

export type DeviceAuthorizationPluginOptions = {
  /**
   * Override the plugin's default localization strings.
   * @remarks `DeviceAuthorizationLocalization`
   */
  localization?: Partial<DeviceAuthorizationLocalization>
  /**
   * URL segment for the device-authorization view.
   * @remarks `string`
   * @default "device"
   */
  path?: string
  /**
   * Number of characters rendered by the device-code input.
   *
   * Keep this in sync with Better Auth's `deviceAuthorization({ userCodeLength })`
   * server option.
   *
   * @default 8
   */
  userCodeLength?: number
}

const DEFAULT_USER_CODE_LENGTH = 8

function resolveUserCodeLength(value?: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return DEFAULT_USER_CODE_LENGTH
  }

  return Math.max(1, Math.floor(value))
}

export const deviceAuthorizationPlugin = createAuthPlugin(
  "deviceAuthorization",
  (options: DeviceAuthorizationPluginOptions = {}) => ({
    localization: {
      ...deviceAuthorizationLocalization,
      ...options.localization
    },
    userCodeLength: resolveUserCodeLength(options.userCodeLength),
    viewPaths: {
      auth: {
        deviceAuthorization: options.path ?? "device"
      }
    }
  })
)
