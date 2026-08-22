import { type QueryClient, skipToken } from "@tanstack/query-core"
import { describe, expect, it, vi } from "vitest"
import {
  ensureOrganization,
  fetchOrganization,
  organizationOptions,
  organizationQueryKeys,
  prefetchOrganization
} from "../src/plugins/organization"

const organization = {
  id: "org-1",
  name: "Acme",
  slug: "acme",
  createdAt: new Date("2026-08-22T08:00:00.000Z")
}

const createAuthClient = () => ({
  organization: {
    getOrganization: vi.fn(async () => organization)
  }
})

describe("organization client parity", () => {
  it("fetches organization details only with a signed-in user and explicit scope", async () => {
    const authClient = createAuthClient()

    expect(
      organizationOptions(authClient as never, undefined, {
        query: { organizationId: "org-1" }
      } as never).queryFn
    ).toBe(skipToken)
    expect(organizationOptions(authClient as never, "user-1").queryFn).toBe(
      skipToken
    )

    const options = organizationOptions(authClient as never, "user-1", {
      query: { organizationSlug: "acme" }
    } as never)
    const data = await (
      options.queryFn as (context: {
        signal?: AbortSignal
      }) => Promise<typeof organization>
    )({})

    expect(data).toBe(organization)
    expect(authClient.organization.getOrganization).toHaveBeenCalledWith(
      expect.objectContaining({ query: { organizationSlug: "acme" } })
    )
    expect(options.queryKey).toEqual(
      organizationQueryKeys.detail("user-1", {
        organizationSlug: "acme"
      })
    )
  })

  it("preserves scope guards when callers supply a query function", () => {
    const authClient = createAuthClient()
    const callerQueryFn = vi.fn(async () => organization)
    const ensureQueryData = vi.fn()
    const prefetchQuery = vi.fn()
    const fetchQuery = vi.fn()
    const queryClient = {
      ensureQueryData,
      fetchQuery,
      prefetchQuery
    } as unknown as QueryClient
    const unsafeOptions = {
      queryFn: callerQueryFn
    } as never

    ensureOrganization(
      queryClient,
      authClient as never,
      "user-1",
      unsafeOptions
    )
    prefetchOrganization(
      queryClient,
      authClient as never,
      "user-1",
      unsafeOptions
    )
    fetchOrganization(queryClient, authClient as never, "user-1", unsafeOptions)

    for (const queryMethod of [ensureQueryData, prefetchQuery, fetchQuery]) {
      expect(queryMethod).toHaveBeenCalledWith(
        expect.objectContaining({ queryFn: skipToken })
      )
    }
    expect(callerQueryFn).not.toHaveBeenCalled()
  })
})
