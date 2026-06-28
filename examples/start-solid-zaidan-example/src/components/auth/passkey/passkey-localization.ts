import type { AuthPlugin } from "@better-auth-ui/core"
import {
  passkeyPlugin as corePasskeyPlugin,
  type PasskeyLocalization,
  passkeyLocalization
} from "@better-auth-ui/core/plugins/passkey"

export function passkeyLabels(auth: { plugins: AuthPlugin[] }) {
  const plugin = auth.plugins.find(
    (plugin) => plugin.id === corePasskeyPlugin.id
  )

  return {
    ...passkeyLocalization,
    ...(plugin?.localization as Partial<PasskeyLocalization> | undefined)
  }
}
