import { QueryClient } from "@tanstack/query-core"
import { expect, it, vi } from "vitest"
import { oauthClientsOptions } from "../src/plugins/oauth-provider/oauth-clients-query"
import {
  createOAuthClientOptions,
  rotateOAuthClientSecretOptions
} from "../src/plugins/oauth-provider/oauth-client-mutations"
import type {
  OAuthClientManager,
  OAuthClientOwner
} from "../src/plugins/oauth-provider/oauth-client-manager"
it("passes explicit organization ownership and keeps client secrets out of the list cache", async () => {
  const owner: OAuthClientOwner = {
    type: "organization",
    organizationId: "org",
    organizationSlug: "team"
  }
  const returned = {
    client_id: "client",
    client_name: "Native",
    client_secret: "secret",
    redirect_uris: ["myapp://oauth/callback"]
  }
  const manager = {
    list: vi.fn(async () => [returned])
  } as unknown as OAuthClientManager
  const queryClient = new QueryClient()
  const options = oauthClientsOptions(manager, owner, "org")
  const clients = await queryClient.fetchQuery(options)
  expect(manager.list).toHaveBeenCalledWith(owner, expect.any(AbortSignal))
  expect(clients[0]).toEqual({
    client_id: "client",
    client_name: "Native",
    redirect_uris: ["myapp://oauth/callback"]
  })
  expect(queryClient.getQueryData(options.queryKey)).toEqual(clients)
  expect(returned.client_secret).toBe("secret")
  expect(createOAuthClientOptions(manager, owner, "org").gcTime).toBe(0)
  expect(rotateOAuthClientSecretOptions(manager, owner, "org").gcTime).toBe(0)
})
