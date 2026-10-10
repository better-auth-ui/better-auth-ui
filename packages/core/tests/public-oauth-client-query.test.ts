import { QueryClient } from "@tanstack/query-core"
import { describe, expect, it, vi } from "vitest"
import {
  fetchPublicOAuthClient,
  ensurePublicOAuthClient,
  prefetchPublicOAuthClient,
  publicOAuthClientOptions
} from "../src/plugins/oauth-provider"

const firstQuery = "?client_id=client&scope=openid&sig=first&exp=100"
const secondQuery = "?client_id=client&scope=email&sig=second&exp=200"

function createClient() {
  return {
    oauth2: {
      publicClient: vi.fn(async () => ({ client_id: "client" })),
      publicClientPrelogin: vi.fn(async () => ({ client_id: "client" }))
    }
  }
}

describe("signed public OAuth client queries", () => {
  it("isolates verification from regular metadata and from other signed requests", async () => {
    const client = createClient()
    const queryClient = new QueryClient()
    await queryClient.fetchQuery(
      publicOAuthClientOptions(client as never, "client")
    )
    await fetchPublicOAuthClient(queryClient, client as never, "client", {
      oauthQuery: firstQuery,
      staleTime: Infinity
    })
    await ensurePublicOAuthClient(queryClient, client as never, "client", {
      oauthQuery: firstQuery
    })
    await prefetchPublicOAuthClient(queryClient, client as never, "client", {
      oauthQuery: secondQuery
    })

    expect(client.oauth2.publicClient).toHaveBeenCalledTimes(1)
    expect(client.oauth2.publicClientPrelogin).toHaveBeenCalledTimes(2)
    expect(client.oauth2.publicClientPrelogin).toHaveBeenNthCalledWith(1, {
      client_id: "client",
      oauth_query: firstQuery,
      fetchOptions: expect.objectContaining({
        throw: true,
        signal: expect.any(AbortSignal)
      })
    })
    expect(client.oauth2.publicClientPrelogin).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ oauth_query: secondQuery })
    )
  })

  it.each([
    "?client_id=another-client&sig=signed",
    "?client_id=client&client_id=another-client&sig=signed"
  ])(
    "rejects mismatched or ambiguous client identity (%s)",
    async (oauthQuery) => {
      const client = createClient()
      await expect(
        fetchPublicOAuthClient(new QueryClient(), client as never, "client", {
          oauthQuery,
          retry: false
        })
      ).rejects.toThrow("client ID does not match")
      expect(client.oauth2.publicClientPrelogin).not.toHaveBeenCalled()
      expect(client.oauth2.publicClient).not.toHaveBeenCalled()
    }
  )

  it("propagates rejected verification without falling back to regular metadata", async () => {
    const client = createClient()
    const error = new Error("Invalid signature")
    client.oauth2.publicClientPrelogin.mockRejectedValue(error)
    const queryClient = new QueryClient()
    await expect(
      fetchPublicOAuthClient(queryClient, client as never, "client", {
        oauthQuery: firstQuery,
        retry: false
      })
    ).rejects.toBe(error)
    expect(client.oauth2.publicClient).not.toHaveBeenCalled()
  })
})
