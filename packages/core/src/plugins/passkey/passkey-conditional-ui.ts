import type { AuthPluginBase } from "../../lib/auth-plugin"
import { passkeyPlugin } from "./passkey-plugin"

/**
 * Autocomplete token that opts an input into WebAuthn conditional UI.
 *
 * Browsers only honour it as the *last* token of the attribute, which is why
 * {@link withPasskeyAutoFill} appends rather than prepends.
 */
export const webAuthnAutoCompleteToken = "webauthn"

/**
 * Append the `webauthn` autocomplete token when passkey autofill is active.
 *
 * @param autoComplete - The field's regular autocomplete value, e.g. `"email"`.
 * @param enabled - Whether the passkey plugin has conditional UI turned on.
 *
 * @example
 * ```tsx
 * <input autoComplete={withPasskeyAutoFill("email", passkeyAutoFill)} />
 * ```
 */
export function withPasskeyAutoFill(autoComplete: string, enabled: boolean) {
  if (!enabled) return autoComplete

  const tokens = autoComplete
    .split(/[\t\n\f\r ]+/)
    .filter(
      (token) =>
        token && token.toLowerCase() !== webAuthnAutoCompleteToken.toLowerCase()
    )

  return [...tokens, webAuthnAutoCompleteToken].join(" ")
}

/**
 * Whether the registered passkey plugin has conditional UI enabled.
 *
 * Returns `false` when the passkey plugin isn't registered at all, so sign-in
 * forms can call this without knowing which plugins a consumer installed.
 *
 * @param plugins - The plugin list from `useAuth()`.
 */
export function isPasskeyAutoFillEnabled(plugins: AuthPluginBase[]) {
  const plugin = plugins.find((candidate) => candidate.id === passkeyPlugin.id)

  return (
    (plugin as ReturnType<typeof passkeyPlugin> | undefined)?.autoFill ?? false
  )
}

/**
 * Whether the browser can service a WebAuthn request with conditional
 * mediation, i.e. render passkeys inside the autofill dropdown instead of a
 * modal.
 *
 * Resolves `false` outside the browser and on engines that predate the API,
 * so callers can await it unconditionally.
 */
export async function isConditionalMediationAvailable() {
  if (typeof window === "undefined") return false

  const { PublicKeyCredential } = window

  if (
    typeof PublicKeyCredential?.isConditionalMediationAvailable !== "function"
  ) {
    return false
  }

  try {
    return await PublicKeyCredential.isConditionalMediationAvailable()
  } catch {
    // Treat a throwing feature probe the same as an unsupported browser.
    return false
  }
}
