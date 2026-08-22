import { createAuthPlugin } from "../../lib/create-auth-plugin"
import {
  type PasskeyLocalization,
  passkeyLocalization
} from "./passkey-localization"

export type PasskeyAuthenticatorAttachment =
  | "any"
  | "platform"
  | "cross-platform"

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
   * Show an authenticator choice when users add a passkey and select its
   * initial value. Use `false` to hide the choice and let the browser decide.
   *
   * Better Auth forwards `"platform"` and `"cross-platform"` to WebAuthn.
   * `"any"` leaves `authenticatorAttachment` unset.
   * @default "any"
   */
  authenticatorAttachment?: PasskeyAuthenticatorAttachment | false
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
    authenticatorAttachment: options.authenticatorAttachment ?? "any",
    localization: { ...passkeyLocalization, ...options.localization }
  })
)

/** Convert the dialog choice to Better Auth's `addPasskey` parameter. */
export function resolvePasskeyAuthenticatorAttachment(value: unknown) {
  return value === "platform" || value === "cross-platform" ? value : undefined
}
