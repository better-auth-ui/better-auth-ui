import { QueryClient } from "@tanstack/query-core"
import { describe, expect, it, vi } from "vitest"
import {
  activeOrganizationOptions,
  getActiveOrganization,
  resolveActiveOrganizationQuery
} from "../src/plugins/organization/active-organization-query"
import { organizationQueryKeys } from "../src/plugins/organization/organization-query-keys"

const authClient = {} as never
const userId = "user-1"

describe("active organization cache reads", () => {
  it("keeps the no-organization sentinel separate from the session organization", () => {
    const params = { query: { organizationSlug: null } } as never
    const queryClient = new QueryClient()
    const options = activeOrganizationOptions(authClient, userId, params)

    queryClient.setQueryData(options.queryKey, null)

    expect(
      getActiveOrganization(queryClient, authClient, userId, params)
    ).toBeNull()
    expect(
      getActiveOrganization(queryClient, authClient, userId)
    ).toBeUndefined()
    expect(options.queryKey).not.toEqual(
      organizationQueryKeys.activeOrganization(userId)
    )
  })

  it("keeps a concrete slug on its own cache key", () => {
    const params = { query: { organizationSlug: "acme" } } as never
    const organization = { id: "org-1", slug: "acme" }
    const queryClient = new QueryClient()
    const options = activeOrganizationOptions(authClient, userId, params)

    queryClient.setQueryData(options.queryKey, organization)

    expect(
      getActiveOrganization(queryClient, authClient, userId, params)
    ).toEqual(organization)
    expect(
      getActiveOrganization(queryClient, authClient, userId, {
        query: { organizationSlug: null }
      } as never)
    ).toBeUndefined()
  })

  it("returns null for the no-organization sentinel without a request", async () => {
    const getFullOrganization = vi.fn()
    const queryClient = new QueryClient()

    const organization = await queryClient.fetchQuery(
      activeOrganizationOptions(
        { organization: { getFullOrganization } } as never,
        userId,
        { query: { organizationSlug: null } } as never
      )
    )

    expect(organization).toBeNull()
    expect(getFullOrganization).not.toHaveBeenCalled()
  })
})

describe("active organization selection", () => {
  it.each([
    [{ organizationId: "org-1", membersLimit: 25 }, "route-org"],
    [{ organizationSlug: "explicit-org", membersLimit: 25 }, "route-org"]
  ])("keeps the explicit selector in %#", (query, pluginSlug) => {
    expect(resolveActiveOrganizationQuery(query as never, pluginSlug)).toEqual(
      query
    )
  })

  it("adds the plugin slug without dropping other query fields", () => {
    expect(
      resolveActiveOrganizationQuery({ membersLimit: 25 } as never, "route-org")
    ).toEqual({ membersLimit: 25, organizationSlug: "route-org" })
  })

  it("uses a null plugin slug only when no explicit selector exists", () => {
    expect(
      resolveActiveOrganizationQuery({ membersLimit: 25 } as never, null)
    ).toEqual({ membersLimit: 25, organizationSlug: null })

    expect(
      resolveActiveOrganizationQuery(
        { organizationId: "org-1", membersLimit: 25 } as never,
        null
      )
    ).toEqual({ organizationId: "org-1", membersLimit: 25 })
  })

  it.each([
    { organizationId: "org-1" },
    { organizationSlug: "acme" },
    undefined
  ])("forwards the Better Auth selector in %#", async (query) => {
    const organization = { id: "org-1", slug: "acme" }
    const getFullOrganization = vi.fn(async () => organization)
    const queryClient = new QueryClient()
    const params = query ? ({ query } as never) : undefined

    await expect(
      queryClient.fetchQuery(
        activeOrganizationOptions(
          { organization: { getFullOrganization } } as never,
          userId,
          params
        )
      )
    ).resolves.toEqual(organization)

    expect(getFullOrganization).toHaveBeenCalledWith(
      expect.objectContaining(query ? { query } : {})
    )
  })
})
