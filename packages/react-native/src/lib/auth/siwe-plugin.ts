import { createAuthPlugin } from "@better-auth-ui/core"
import {
  siwePlugin as coreSiwePlugin,
  type SiwePluginOptions
} from "@better-auth-ui/core/plugins/siwe"

import { SignInEthereumButton } from "../../components/auth/siwe/sign-in-ethereum-button"
import { WalletAccounts } from "../../components/auth/siwe/wallet-accounts"

export const siwePlugin = createAuthPlugin(
  coreSiwePlugin.id,
  (options: SiwePluginOptions) => ({
    ...coreSiwePlugin(options),
    authButtons: [SignInEthereumButton],
    securityCards: options.walletManager ? [WalletAccounts] : []
  })
)
