import { describe, expect, it, vi } from "vitest"

import {
  createEip1193WalletConnector,
  createSiweMessage,
  linkSiweWalletOptions,
  signInSiweOptions,
  siwePlugin,
  siweQueryKeys,
  unlinkSiweWalletOptions
} from "../src/plugins/siwe"

describe("SIWE", () => {
  it("builds a valid ERC-4361 message with optional fields", () => {
    const message = createSiweMessage({
      domain: "app.example.com",
      address: "0x1234",
      uri: "https://app.example.com",
      chainId: 1,
      nonce: "nonce-123",
      statement: "Sign in to Example",
      issuedAt: new Date("2026-08-19T12:00:00.000Z"),
      resources: ["https://app.example.com/account"]
    })

    expect(message).toBe(
      "app.example.com wants you to sign in with your Ethereum account:\n" +
        "\n0x1234\n\nSign in to Example\n\n" +
        "URI: https://app.example.com\nVersion: 1\nChain ID: 1\n" +
        "Nonce: nonce-123\nIssued At: 2026-08-19T12:00:00.000Z\n" +
        "Resources:\n- https://app.example.com/account"
    )
  })

  it("connects and signs through an EIP-1193 provider", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(["0xabc"])
      .mockResolvedValueOnce("0x89")
      .mockResolvedValueOnce("0xsigned")
    const connector = createEip1193WalletConnector({
      provider: { request },
      label: "Browser wallet"
    })

    await expect(connector.connect()).resolves.toEqual({
      address: "0xabc",
      chainId: 137
    })
    await expect(
      connector.signMessage({ address: "0xabc", message: "hello" })
    ).resolves.toBe("0xsigned")
    expect(request).toHaveBeenLastCalledWith({
      method: "personal_sign",
      params: ["0x68656c6c6f", "0xabc"]
    })
  })

  it("requests a nonce before signing and verifying", async () => {
    const connect = vi.fn(async () => ({ address: "0xabc", chainId: 1 }))
    const signMessage = vi.fn(async () => "0xsigned")
    const nonce = vi.fn(async () => ({
      data: { nonce: "fresh-nonce" },
      error: null
    }))
    const verify = vi.fn(async () => ({ data: { success: true }, error: null }))
    const options = signInSiweOptions({ siwe: { nonce, verify } } as never, {
      connector: { id: "test", label: "Test", connect, signMessage },
      domain: "app.example.com",
      uri: "https://app.example.com"
    })

    await options.mutationFn?.({ email: "person@example.com" })

    expect(nonce).toHaveBeenCalledWith({
      fetchOptions: { throw: true }
    })
    expect(signMessage).toHaveBeenCalledWith({
      address: "0xabc",
      message: expect.stringContaining("Nonce: fresh-nonce")
    })
    expect(verify).toHaveBeenCalledWith(
      expect.objectContaining({
        signature: "0xsigned",
        email: "person@example.com",
        fetchOptions: { throw: true }
      })
    )
  })

  it("registers optional wallet management and invalidates its user cache", async () => {
    const manager = {
      list: vi.fn(),
      createLinkChallenge: vi.fn(async () => ({ message: "link-message" })),
      link: vi.fn(async () => undefined),
      unlink: vi.fn(async () => undefined),
      setPrimary: vi.fn()
    }
    const plugin = siwePlugin({
      connector: { id: "test", label: "Test" } as never,
      domain: "app.example.com",
      uri: "https://app.example.com",
      walletManager: manager
    })
    const mutation = unlinkSiweWalletOptions(manager, "user-1")

    expect(plugin).toMatchObject({
      id: "siwe",
      email: "optional",
      walletManager: manager
    })
    await mutation.mutationFn?.("wallet-1")
    expect(manager.unlink).toHaveBeenCalledWith("wallet-1")
    expect(mutation.meta?.awaits).toEqual([siweQueryKeys.wallets("user-1")])
  })

  it("proves wallet ownership before linking it to the current session", async () => {
    const connector = {
      id: "test",
      label: "Test",
      connect: vi.fn(async () => ({ address: "0xabc", chainId: 1 })),
      signMessage: vi.fn(async () => "0xsigned")
    }
    const manager = {
      list: vi.fn(),
      createLinkChallenge: vi.fn(async () => ({ message: "link-message" })),
      link: vi.fn(async () => undefined),
      unlink: vi.fn(),
      setPrimary: vi.fn()
    }

    await linkSiweWalletOptions(manager, connector, "user-1").mutationFn?.()

    expect(manager.createLinkChallenge).toHaveBeenCalledWith({
      address: "0xabc",
      chainId: 1
    })
    expect(connector.signMessage).toHaveBeenCalledWith({
      address: "0xabc",
      message: "link-message"
    })
    expect(manager.link).toHaveBeenCalledWith({
      address: "0xabc",
      chainId: 1,
      message: "link-message",
      signature: "0xsigned"
    })
  })
})
