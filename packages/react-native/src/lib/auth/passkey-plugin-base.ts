import { createAuthPlugin } from "@better-auth-ui/core"
import {
  passkeyPlugin as corePasskeyPlugin,
  type PasskeyPluginOptions,
  type PasskeyAuthClient
} from "@better-auth-ui/core/plugins/passkey"

export type NativePasskeyPluginOptions = PasskeyPluginOptions & {
  /** A Better Auth compatible client that implements native credential ceremonies. */
  client: PasskeyAuthClient
}

/**
 * Passkey plugin without its slot components. Slot components look the plugin
 * up through this factory, which shares the `passkeyPlugin` id, so they can
 * read `client` without importing the module that registers them.
 */
export const passkeyPluginBase = createAuthPlugin(
  corePasskeyPlugin.id,
  (options: NativePasskeyPluginOptions) => ({
    ...corePasskeyPlugin({ ...options, autoFill: options.autoFill ?? false }),
    client: options.client
  })
)
