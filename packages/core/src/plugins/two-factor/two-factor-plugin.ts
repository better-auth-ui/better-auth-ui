import { createAuthPlugin } from "../../lib/create-auth-plugin"
// Side-effect import so this file participates in declaration merging on the
// same module instance that external consumers reach via `@better-auth-ui/core`.
import type {} from "../../lib/view-paths"
import {
  type TwoFactorLocalization,
  twoFactorLocalization
} from "./two-factor-localization"

declare module "../../lib/view-paths" {
  /** Widens `AuthViewPaths` with the two-factor path when this plugin is imported. */
  interface AuthViewPaths {
    /** @default "two-factor" */
    twoFactor?: string
  }
}

export type TwoFactorPluginOptions = {
  /**
   * Override the plugin's default localization strings.
   * @remarks `TwoFactorLocalization`
   */
  localization?: Partial<TwoFactorLocalization>
  /**
   * URL segment for the two-factor challenge view.
   * @remarks `string`
   * @default "two-factor"
   */
  path?: string
  /**
   * Number of characters rendered by the TOTP and OTP inputs.
   *
   * Keep this in sync with Better Auth's `twoFactor({ totpOptions: { digits } })`
   * and `twoFactor({ otpOptions: { digits } })` server options.
   *
   * @remarks `number`
   * @default 6
   */
  codeLength?: number
  /**
   * Offer backup-code recovery on the challenge view and expose backup-code
   * management in settings.
   *
   * Turn this off when the server sets `backupCodeOptions: { enabled: false }`.
   *
   * @remarks `boolean`
   * @default true
   */
  backupCodes?: boolean
  /**
   * Show the "Trust this device" checkbox on the challenge view.
   *
   * @remarks `boolean`
   * @default true
   */
  trustDevice?: boolean
  /**
   * Manage two-factor without asking for a password.
   *
   * Mirrors Better Auth's `twoFactor({ allowPasswordless })` server option,
   * which only skips the password for accounts that have no credential
   * account (e.g. passkey-only users) — set both or neither.
   *
   * @remarks `boolean`
   * @default false
   */
  allowPasswordless?: boolean
}

const DEFAULT_CODE_LENGTH = 6

function resolveCodeLength(value?: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return DEFAULT_CODE_LENGTH
  }

  return Math.max(1, Math.floor(value))
}

export const twoFactorPlugin = createAuthPlugin(
  "twoFactor",
  (options: TwoFactorPluginOptions = {}) => ({
    localization: { ...twoFactorLocalization, ...options.localization },
    codeLength: resolveCodeLength(options.codeLength),
    backupCodes: options.backupCodes ?? true,
    trustDevice: options.trustDevice ?? true,
    allowPasswordless: options.allowPasswordless ?? false,
    viewPaths: {
      auth: {
        twoFactor: options.path ?? "two-factor"
      }
    }
  })
)
