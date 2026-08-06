import { QueryClient } from "@tanstack/query-core"
import { describe, expect, it } from "vitest"
import {
  activeOrganizationOptions,
  getActiveOrganization
} from "../src/plugins/organization/active-organization-query"

const authClient = {} as never
const userId = "user-1"

describe("active organization cache reads", () => {
  it("reads the cached entry when the slug is null", () => {
    // `organizationSlug: null` ("no active organization") is normalized away
    // before the cache key is built. The synchronous reader must apply the same
    // normalization, or it computes a different key and misses the entry.
    const params = { query: { organizationSlug: null } } as never
    const queryClient = new QueryClient()
    const options = activeOrganizationOptions(authClient, userId, params)

    queryClient.setQueryData(options.queryKey, null)

    expect(
      getActiveOrganization(queryClient, authClient, userId, params)
    ).toBeNull()
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
    // A null-slug read must NOT collide with a concrete-slug entry.
    expect(
      getActiveOrganization(queryClient, authClient, userId, {
        query: { organizationSlug: null }
      } as never)
    ).toBeUndefined()
  })
})
