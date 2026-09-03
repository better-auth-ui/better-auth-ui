import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
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

  it("does not connect a wallet when required email is empty", async () => {
    const user = userEvent.setup()
    const connect = vi.fn(async () => ({
      address: "0x123",
      chainId: 1
    }))
    const requiredEmailConnector = {
      id: "injected",
      label: "Ethereum",
      connect,
      signMessage: vi.fn(async () => "0xsigned")
    }
    const authClient = {
      siwe: {
        nonce: vi.fn(async () => ({ data: { nonce: "nonce" } })),
        verify: vi.fn(async () => ({ data: {}, error: null }))
      },
      useSession: () => ({ data: null, isPending: false, error: null })
    } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]

    render(
      <AuthProvider
        authClient={authClient}
        navigate={vi.fn()}
        plugins={[
          siwePlugin({
            connector: requiredEmailConnector,
            domain: "app.example.com",
            email: "required",
            uri: "https://app.example.com"
          })
        ]}
      >
        <SignInEthereumButton />
      </AuthProvider>
    )

    await user.click(
      screen.getByRole("button", { name: /continue with ethereum/i })
    )
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: /sign/i }))

    expect(
      await within(dialog).findByText("This field is required")
    ).toBeVisible()
    expect(connect).not.toHaveBeenCalled()
  })
})
