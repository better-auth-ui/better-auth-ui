import { QueryClient } from "@tanstack/query-core"
import { describe, expect, it, vi } from "vitest"
import type { PasskeyAuthClient } from "../src/plugins/passkey/passkey-auth-client"
import { signInPasskeyOptions } from "../src/plugins/passkey/sign-in-passkey-mutation"

describe("passkey sign-in results", () => {
  it("rejects returned errors instead of navigating through onSuccess", async () => {
    const error = { code: "ERROR_CEREMONY_ABORTED", status: 400 }
    const authClient = {
      signIn: {
        passkey: vi.fn<
          () => Promise<{ data: null; error: { code: string; status: number } }>
        >(async () => ({ data: null, error }))
      }
    } as unknown as PasskeyAuthClient
    const client = new QueryClient()
    const onSuccess = vi.fn<(...args: unknown[]) => unknown>()
    const onError = vi.fn<(...args: unknown[]) => unknown>()
    const mutation = client.getMutationCache().build(client, {
      ...signInPasskeyOptions(authClient),
      onSuccess,
      onError
    })
    await expect(mutation.execute(undefined)).rejects.toBe(error)
    expect(onSuccess).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledOnce()
    client.clear()
  })

  it("preserves successful results", async () => {
    const result = { data: { user: { id: "user" } }, error: null }
    const authClient = {
      signIn: {
        passkey: vi.fn<
          () => Promise<{ data: { user: { id: string } }; error: null }>
        >(async () => result)
      }
    } as unknown as PasskeyAuthClient
    const client = new QueryClient()
    const mutation = client
      .getMutationCache()
      .build(client, signInPasskeyOptions(authClient))
    await expect(mutation.execute(undefined)).resolves.toBe(result)
    client.clear()
  })
})
