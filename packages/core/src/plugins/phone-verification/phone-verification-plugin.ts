import { createAuthPlugin } from "../../lib/create-auth-plugin"
// Side-effect import so this file participates in declaration merging on the
// same module instance that external consumers reach via `@better-auth-ui/core`.
import type {} from "../../lib/view-paths"
import { createPhoneVerificationClient } from "./phone-verification-client"
import {
  type PhoneVerificationLocalization,
  phoneVerificationLocalization
} from "./phone-verification-localization"
import type {
  PhoneVerificationFlow,
  PhoneVerificationProvider
} from "./phone-verification-provider"

declare module "../../lib/view-paths" {
  /** Widens `AuthViewPaths` by adding the `"phoneVerification"` path when this plugin is imported. */
  interface AuthViewPaths {
    /** @default "phone-verification" */
    phoneVerification?: string
  }
}

export type PhoneVerificationPluginOptions = {
  /**
   * Client used by hooks and components for all verification calls. Defaults
   * to `createPhoneVerificationClient({ endpoint })`, which proxies through
   * the developer's backend — provide your own to swap the transport.
   * @remarks `PhoneVerificationProvider`
   */
  client?: PhoneVerificationProvider
  /**
   * Backend endpoint the default client talks to.
   * @remarks `string`
   * @default "/api/phone-verification"
   */
  endpoint?: string
  /**
   * Verification flow variant.
   * @remarks `"phone" | "login" | "2fa"`
   * @default "phone"
   */
  flow?: PhoneVerificationFlow
  /**
   * Interval in milliseconds between status polls while pending.
   * @remarks `number`
   * @default 3000
   */
  pollingInterval?: number
  /**
   * Milliseconds before a pending verification resolves to `"timeout"`.
   * @remarks `number`
   * @default 300000
   */
  timeout?: number
  /**
   * Rendered size of the QR code in pixels.
   * @remarks `number`
   * @default 192
   */
  qrSize?: number
  /**
   * Override the plugin's default localization strings.
   * @remarks `PhoneVerificationLocalization`
   */
  localization?: Partial<PhoneVerificationLocalization>
  /**
   * URL segment for the phone-verification view.
   * @remarks `string`
   * @default "phone-verification"
   */
  path?: string
}

export const phoneVerificationPlugin = createAuthPlugin(
  "phoneVerification",
  (options: PhoneVerificationPluginOptions = {}) => ({
    localization: {
      ...phoneVerificationLocalization,
      ...options.localization
    },
    viewPaths: {
      auth: { phoneVerification: options.path ?? "phone-verification" }
    },
    client:
      options.client ??
      createPhoneVerificationClient({ endpoint: options.endpoint }),
    flow: options.flow ?? ("phone" as PhoneVerificationFlow),
    pollingInterval: options.pollingInterval ?? 3000,
    timeout: options.timeout ?? 300_000,
    qrSize: options.qrSize ?? 192
  })
)
