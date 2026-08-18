import { createAuthPlugin } from "../../lib/create-auth-plugin"
import { type SiweLocalization, siweLocalization } from "./siwe-localization"
import type { SiweWalletConnector, SiweWalletManager } from "./siwe-wallet"

export type SiweEmailMode = "none" | "optional" | "required"

export type SiwePluginOptions = {
  connector: SiweWalletConnector
  /** Domain checked by the Better Auth SIWE server plugin. */
  domain: string
  /** Absolute URI included in the ERC-4361 message. */
  uri: string
  statement?: string
  /** @default "optional" */
  email?: SiweEmailMode
  walletManager?: SiweWalletManager
  localization?: Partial<SiweLocalization>
}

export const siwePlugin = createAuthPlugin(
  "siwe",
  (options: SiwePluginOptions) => ({
    connector: options.connector,
    domain: options.domain,
    uri: options.uri,
    statement: options.statement,
    email: options.email ?? "optional",
    walletManager: options.walletManager,
    localization: { ...siweLocalization, ...options.localization }
  })
)
