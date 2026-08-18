import {
  createOAuthClientOptions,
  deleteOAuthConsentOptions,
  listOAuthConsentsOptions,
  oauthClientsOptions,
  oauthConsentOptions,
  oauthContinueOptions,
  oauthProviderMutationKeys,
  oauthProviderQueryKeys,
  publicOAuthClientOptions
} from "@better-auth-ui/core/plugins/oauth-provider"
import { describe, expect, it, vi } from "vitest"

type MutationOptions = { mutationFn: (variables: unknown) => Promise<unknown> }

describe("OAuth provider query and mutation options", () => {
  it("partitions managed clients by explicit owner and forwards create input", async () => {
    const manager = {
      list: vi.fn(async () => []),
      create: vi.fn(async (_owner, input) => ({
        ...input,
        client_id: "client-1"
      })),
      update: vi.fn(),
      delete: vi.fn(),
      rotateSecret: vi.fn()
    }
    const owner = {
      type: "organization" as const,
      organizationId: "org-1",
      organizationSlug: "acme"
    }
    const ownerKey = "organization:org-1:acme"
    const query = oauthClientsOptions(manager, owner, ownerKey)
    const create = createOAuthClientOptions(manager, owner, ownerKey)

    expect(query.queryKey).toEqual(oauthProviderQueryKeys.clients(ownerKey))
    await (query.queryFn as NonNullable<typeof query.queryFn>)({
      signal: new AbortController().signal
    } as never)
    await (create as MutationOptions).mutationFn({
      client_name: "Acme CLI",
      redirect_uris: ["https://example.com/callback"]
    })

    expect(manager.list).toHaveBeenCalledWith(owner, expect.any(AbortSignal))
    expect(manager.create).toHaveBeenCalledWith(owner, {
      client_name: "Acme CLI",
      redirect_uris: ["https://example.com/callback"]
    })
  })

  it("loads public client metadata with a stable key", async () => {
    const publicClient = vi.fn(async ({ query }) => ({
      client_id: query.client_id
    }))
    const authClient = { oauth2: { publicClient } }
    const options = publicOAuthClientOptions(
      authClient as never,
      "desktop-client"
    )

    expect(options.queryKey).toEqual(
      oauthProviderQueryKeys.publicClient("desktop-client")
    )

    await (options.queryFn as NonNullable<typeof options.queryFn>)({
      signal: new AbortController().signal
    } as never)

    expect(publicClient).toHaveBeenCalledWith({
      query: { client_id: "desktop-client" },
      fetchOptions: expect.objectContaining({ throw: true })
    })
  })

  it("submits consent through the shared mutation key", async () => {
    const consent = vi.fn(async ({ accept }) => ({ accept }))
    const authClient = { oauth2: { consent } }
    const options = oauthConsentOptions(authClient as never)

    expect(options.mutationKey).toEqual(oauthProviderMutationKeys.consent)

    await (options as MutationOptions).mutationFn({ accept: true })

    expect(consent).toHaveBeenCalledWith({
      accept: true,
      fetchOptions: { throw: true }
    })
  })

  it("forwards the exact continue payload without rebuilding the OAuth query", async () => {
    const oauthContinue = vi.fn(async () => ({ redirect: true, url: "/done" }))
    const authClient = { oauth2: { continue: oauthContinue } }
    const options = oauthContinueOptions(authClient as never)

    expect(options.mutationKey).toEqual(oauthProviderMutationKeys.continue)

    await (options as MutationOptions).mutationFn({ created: true })
    await (options as MutationOptions).mutationFn({ selected: true })
    await (options as MutationOptions).mutationFn({ postLogin: true })

    expect(oauthContinue.mock.calls).toEqual([
      [{ created: true, fetchOptions: { throw: true } }],
      [{ selected: true, fetchOptions: { throw: true } }],
      [{ postLogin: true, fetchOptions: { throw: true } }]
    ])
  })

  it("lists consents under a user-scoped key", async () => {
    const getConsents = vi.fn(async () => [])
    const authClient = { oauth2: { getConsents } }
    const options = listOAuthConsentsOptions(authClient as never, "user-1")

    expect(options.queryKey).toEqual(
      oauthProviderQueryKeys.listConsents("user-1")
    )
    expect(options.queryKey).not.toEqual(
      listOAuthConsentsOptions(authClient as never, "user-2").queryKey
    )

    await (options.queryFn as NonNullable<typeof options.queryFn>)({
      signal: new AbortController().signal
    } as never)

    expect(getConsents).toHaveBeenCalledWith({
      fetchOptions: expect.objectContaining({ throw: true })
    })
  })

  it("deletes a consent record by id", async () => {
    const deleteConsent = vi.fn(async () => undefined)
    const authClient = { oauth2: { deleteConsent } }
    const options = deleteOAuthConsentOptions(authClient as never)

    expect(options.mutationKey).toEqual(oauthProviderMutationKeys.deleteConsent)

    await (options as MutationOptions).mutationFn({ id: "consent-1" })

    expect(deleteConsent).toHaveBeenCalledWith({
      id: "consent-1",
      fetchOptions: { throw: true }
    })
  })
})
