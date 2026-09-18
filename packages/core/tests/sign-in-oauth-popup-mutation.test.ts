import { QueryClient } from "@tanstack/query-core"
import { describe, expect, it, vi } from "vitest"
import { authQueryKeys } from "../src/lib/auth-query-keys"
import {
  type OAuthPopupAuthClient,
  signInOAuthPopupOptions
} from "../src/mutations/sign-in-oauth-popup-mutation"

describe("popup sign-in session refresh", () => {
  it("refreshes an inactive signed-out cache before success callbacks run", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity } }
    })
    client.setQueryData(authQueryKeys.session, null)
    const session = { user: { id: "user-1" }, session: { id: "session-1" } }
    const authClient = {
      signIn: {
        popup: vi.fn(async () => ({ data: { success: true }, error: null }))
      },
      getSession: vi.fn(async () => session)
    } as unknown as OAuthPopupAuthClient
    const onSuccess = vi.fn(() => {
      expect(client.getQueryData(authQueryKeys.session)).toEqual(session)
    })
    const mutation = client.getMutationCache().build(client, {
      ...signInOAuthPopupOptions(authClient),
      onSuccess
    })

    await mutation.execute({ provider: "github" })

    expect(authClient.getSession).toHaveBeenCalledOnce()
    expect(onSuccess).toHaveBeenCalledOnce()
    client.clear()
  })

  it("cancels an in-flight pre-login session request", async () => {
    const client = new QueryClient()
    let resolveOldSession!: (value: null) => void
    let oldSignal!: AbortSignal
    const oldRequest = client
      .fetchQuery({
        queryKey: authQueryKeys.session,
        queryFn: ({ signal }) => {
          oldSignal = signal
          return new Promise<null>((resolve) => {
            resolveOldSession = resolve
          })
        }
      })
      .catch(() => undefined)
    const session = { user: { id: "user-1" }, session: { id: "session-1" } }
    const authClient = {
      signIn: { popup: async () => ({ data: { success: true }, error: null }) },
      getSession: async () => session
    } as unknown as OAuthPopupAuthClient
    const mutation = client
      .getMutationCache()
      .build(client, signInOAuthPopupOptions(authClient))

    await mutation.execute({ provider: "github" })
    resolveOldSession(null)
    await oldRequest

    expect(oldSignal.aborted).toBe(true)
    expect(client.getQueryData(authQueryKeys.session)).toEqual(session)
    client.clear()
  })

  it("does not report success when the session refresh fails", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
    const error = new Error("Session refresh failed")
    const authClient = {
      signIn: { popup: async () => ({ data: { success: true }, error: null }) },
      getSession: async () => {
        throw error
      }
    } as unknown as OAuthPopupAuthClient
    const onSuccess = vi.fn()
    const mutation = client.getMutationCache().build(client, {
      ...signInOAuthPopupOptions(authClient),
      onSuccess
    })

    await expect(mutation.execute({ provider: "github" })).rejects.toBe(error)
    expect(onSuccess).not.toHaveBeenCalled()
    client.clear()
  })
})
