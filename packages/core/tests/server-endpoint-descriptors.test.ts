import { describe, expect, it, vi } from "vitest"
import { authQueryKeys } from "../src"
import {
  apiKeyQueryKeys,
  organizationQueryKeys,
  passkeyQueryKeys
} from "../src/plugins"
import {
  activeOrganizationOptions,
  listApiKeysOptions,
  listOrganizationsOptions,
  listPasskeysOptions,
  sessionOptions
} from "../src/server"

describe("core server endpoint descriptors", () => {
  it("owns representative server endpoint keys and metadata", () => {
    const userId = "user-1"
    const query = { organizationId: "org-1" }
    const params = { query }
    const auth = {
      api: {
        getSession: vi.fn(),
        listApiKeys: vi.fn(),
        getFullOrganization: vi.fn(),
        listOrganizations: vi.fn(),
        listPasskeys: vi.fn()
      }
    }

    expect(
      sessionOptions(auth as never, { headers: new Headers() } as never)
        .queryKey
    ).toEqual(authQueryKeys.session)
    expect(
      listOrganizationsOptions(auth as never, userId, params as never).queryKey
    ).toEqual(organizationQueryKeys.list(userId, query))
    expect(
      activeOrganizationOptions(auth as never, userId, params as never).queryKey
    ).toEqual(organizationQueryKeys.activeOrganization(userId, query))
    expect(
      listPasskeysOptions(auth as never, userId, params as never).queryKey
    ).toEqual(passkeyQueryKeys.list(userId, query))
    expect(
      listApiKeysOptions(auth as never, userId, params as never).queryKey
    ).toEqual(apiKeyQueryKeys.list(userId, query))

    expect(
      listApiKeysOptions(auth as never, userId, params as never).meta
    ).toEqual({
      package: "@better-auth-ui/core",
      runtime: "server",
      name: "listApiKeys"
    })
  })

  it("forwards params through core descriptor query functions", async () => {
    const data = { apiKeys: [{ id: "key-1" }] }
    const params = { query: { userId: "user-1" } }
    const auth = {
      api: {
        listApiKeys: vi.fn(async () => data)
      }
    }

    const descriptor = listApiKeysOptions(
      auth as never,
      "user-1",
      params as never
    )

    await expect(descriptor.queryFn()).resolves.toBe(data)
    expect(auth.api.listApiKeys).toHaveBeenCalledWith(params)
  })
})
