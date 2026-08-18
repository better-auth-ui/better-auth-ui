import { describe, expect, it } from "vitest"

import { SignInEthereumButton } from "../src/components/auth/siwe/sign-in-ethereum-button"
import { WalletAccounts } from "../src/components/auth/siwe/wallet-accounts"
import { siwePlugin } from "../src/lib/auth/siwe-plugin"

const connector = { id: "injected", label: "Ethereum" } as never

describe("siwePlugin (heroui)", () => {
  it("registers wallet sign-in without exposing an unavailable manager", () => {
    const plugin = siwePlugin({
      connector,
      domain: "app.example.com",
      uri: "https://app.example.com"
    })

    expect(plugin.authButtons).toEqual([SignInEthereumButton])
    expect(plugin.securityCards).toEqual([])
  })

  it("adds wallet settings when a server-backed manager is configured", () => {
    const plugin = siwePlugin({
      connector,
      domain: "app.example.com",
      uri: "https://app.example.com",
      walletManager: {} as never
    })

    expect(plugin.securityCards).toEqual([WalletAccounts])
  })
})
