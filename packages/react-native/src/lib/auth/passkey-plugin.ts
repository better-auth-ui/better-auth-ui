import { createAuthPlugin } from "@better-auth-ui/core"
import { PasskeyButton } from "../../components/auth/passkey/passkey-button"
import { Passkeys } from "../../components/auth/passkey/passkeys"
import {
  type NativePasskeyPluginOptions,
  passkeyPluginBase
} from "./passkey-plugin-base"

export type { NativePasskeyPluginOptions } from "./passkey-plugin-base"

export const passkeyPlugin = createAuthPlugin(
  passkeyPluginBase.id,
  (options: NativePasskeyPluginOptions) => ({
    ...passkeyPluginBase(options),
    authButtons: [PasskeyButton],
    securityCards: [Passkeys]
  })
)
