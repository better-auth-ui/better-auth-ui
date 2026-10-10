import { createAuthPlugin } from "@better-auth-ui/core"
import {
  passkeyPlugin as corePasskeyPlugin,
  type PasskeyPluginOptions,
  type PasskeyAuthClient
} from "@better-auth-ui/core/plugins/passkey"
import { PasskeyButton } from "../../components/auth/passkey/passkey-button"
import { Passkeys } from "../../components/auth/passkey/passkeys"

export type NativePasskeyPluginOptions = PasskeyPluginOptions & {
  /** A Better Auth compatible client that implements native credential ceremonies. */
  client: PasskeyAuthClient
}
export const passkeyPlugin = createAuthPlugin(
  corePasskeyPlugin.id,
  (options: NativePasskeyPluginOptions) => ({
    ...corePasskeyPlugin({ ...options, autoFill: options.autoFill ?? false }),
    client: options.client,
    authButtons: [PasskeyButton],
    securityCards: [Passkeys]
  })
)
