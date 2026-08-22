import { createAuthPlugin } from "../../lib/create-auth-plugin"
import {
  type PasskeyLocalization,
  passkeyLocalization
} from "./passkey-localization"

export type PasskeyPluginOptions = {
  /**
   * Offer passkeys through the browser's autofill dropdown (WebAuthn
   * conditional UI) as soon as a sign-in form mounts, instead of waiting for
   * the user to press the passkey button.
   *
   * Requires the `webauthn` autocomplete token on the identifier field, which
   * the built-in sign-in forms add for you.
   * @default true
   */
  autoFill?: boolean
  /**
   * Override the plugin's default localization strings.
   * @remarks `PasskeyLocalization`
   */
  localization?: Partial<PasskeyLocalization>
}

export const passkeyPlugin = createAuthPlugin(
  "passkey",
  (options: PasskeyPluginOptions = {}) => ({
    autoFill: options.autoFill ?? true,
    localization: { ...passkeyLocalization, ...options.localization }
  })
)
