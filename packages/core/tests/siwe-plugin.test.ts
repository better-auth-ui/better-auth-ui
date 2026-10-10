import { createAuthClient } from "better-auth/client"
import { siweClient } from "better-auth/client/plugins"
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
      nonce: "fresh-nonce"
    }))
    const verify = vi.fn(async () => ({ success: true }))
    const options = signInSiweOptions({ siwe: { nonce, verify } } as never, {
      connector: { id: "test", label: "Test", connect, signMessage },
      domain: "app.example.com",
      uri: "https://app.example.com"
    })

    await options.mutationFn?.({ email: "person@example.com" })

    expect(nonce).toHaveBeenCalledWith(undefined, { throw: true })
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

it("authenticates through the installed Better Auth SIWE client using throw-aware responses", async () => {
  const requests: { url: string; body: Record<string, unknown> }[] = []
  const authClient = createAuthClient({
    baseURL: "https://auth.example",
    plugins: [siweClient()],
    fetchOptions: {
      customFetchImpl: async (input, init) => {
        const url = String(input)
        requests.push({ url, body: JSON.parse(String(init?.body ?? "{}")) })
        return new Response(
          JSON.stringify(
            url.endsWith("/nonce")
              ? { nonce: "server-nonce" }
              : {
                  success: true,
                  token: "token",
                  user: { id: "user", walletAddress: "0xabc", chainId: 1 }
                }
          ),
          { headers: { "Content-Type": "application/json" } }
        )
      }
    }
  })
  const result = await signInSiweOptions(authClient, {
    domain: "app.example",
    uri: "https://app.example",
    connector: {
      id: "native",
      label: "Wallet",
      connect: async () => ({ address: "0xabc", chainId: 1 }),
      signMessage: async () => "signature"
    }
  }).mutationFn({ email: "ada@example.com" })
  expect(result.success).toBe(true)
  expect(requests.map((request) => new URL(request.url).pathname)).toEqual([
    "/api/auth/siwe/nonce",
    "/api/auth/siwe/verify"
  ])
  expect(requests[1]?.body).toEqual(
    expect.objectContaining({
      signature: "signature",
      email: "ada@example.com",
      message: expect.stringContaining("Nonce: server-nonce")
    })
  )
})
