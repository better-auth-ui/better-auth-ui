import type { OAuthClientManager } from "@better-auth-ui/core/plugins/oauth-provider"
import { skipToken } from "@tanstack/react-query"
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
      list: vi.fn<() => Promise<never[]>>(() => Promise.resolve([])),
      create: vi.fn<OAuthClientManager["create"]>((_owner, input) =>
        Promise.resolve({
          ...input,
          client_id: "client-1"
        })
      ),
      update: vi.fn<OAuthClientManager["update"]>(),
      delete: vi.fn<OAuthClientManager["delete"]>(),
      rotateSecret: vi.fn<OAuthClientManager["rotateSecret"]>()
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
    const queryQueryFn = query.queryFn
    if (queryQueryFn === skipToken) {
      throw new Error("Expected a query function")
    }
    await queryQueryFn({
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
    const publicClient = vi.fn<
      (params: { query: { client_id: string } }) => Promise<unknown>
    >(({ query }) =>
      Promise.resolve({
        client_id: query.client_id
      })
    )
    const authClient = { oauth2: { publicClient } }
    const options = publicOAuthClientOptions(
      authClient as never,
      "desktop-client"
    )

    expect(options.queryKey).toEqual(
      oauthProviderQueryKeys.publicClient("desktop-client")
    )

    const optionsQueryFn = options.queryFn
    if (optionsQueryFn === skipToken) {
      throw new Error("Expected a query function")
    }
    await optionsQueryFn({
      signal: new AbortController().signal
    } as never)

    expect(publicClient).toHaveBeenCalledWith({
      query: { client_id: "desktop-client" },
      fetchOptions: expect.objectContaining({ throw: true })
    })
  })

  it("submits consent through the shared mutation key", async () => {
    const consent = vi.fn<(params: { accept: boolean }) => Promise<unknown>>(
      ({ accept }) => Promise.resolve({ accept })
    )
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
    const oauthContinue = vi.fn<
      () => Promise<{ redirect: boolean; url: string }>
    >(() => Promise.resolve({ redirect: true, url: "/done" }))
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
    const getConsents = vi.fn<() => Promise<never[]>>(() => Promise.resolve([]))
    const authClient = { oauth2: { getConsents } }
    const options = listOAuthConsentsOptions(authClient as never, "user-1")

    expect(options.queryKey).toEqual(
      oauthProviderQueryKeys.listConsents("user-1")
    )
    expect(options.queryKey).not.toEqual(
      listOAuthConsentsOptions(authClient as never, "user-2").queryKey
    )

    const optionsQueryFn = options.queryFn
    if (optionsQueryFn === skipToken) {
      throw new Error("Expected a query function")
    }
    await optionsQueryFn({
      signal: new AbortController().signal
    } as never)

    expect(getConsents).toHaveBeenCalledWith({
      fetchOptions: expect.objectContaining({ throw: true })
    })
  })

  it("deletes a consent record by id", async () => {
    const deleteConsent = vi.fn<() => Promise<undefined>>(() =>
      Promise.resolve(undefined)
    )
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
