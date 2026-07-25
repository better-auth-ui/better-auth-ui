import {
  oauthProviderMutationKeys,
  oauthProviderQueryKeys
} from "@better-auth-ui/core/plugins"
import { describe, expect, it, vi } from "vitest"

import { oauthConsentOptions, publicOAuthClientOptions } from "../src"

describe("OAuth provider query and mutation options", () => {
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

    await (
      options as {
        mutationFn: (variables: unknown) => Promise<unknown>
      }
    ).mutationFn({ accept: false })

    expect(consent).toHaveBeenCalledWith({
      accept: false,
      fetchOptions: { throw: true }
    })
  })
})
