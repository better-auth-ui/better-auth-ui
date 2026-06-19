import { describe, expect, it, vi } from "vitest"
import { authQueryKeys } from "../src"
import {
  ensureSession,
  fetchSession,
  prefetchSession,
  sessionOptions
} from "../src/queries/session-query"
import {
  ensureSessionServer,
  fetchSessionServer,
  prefetchSessionServer,
  sessionOptionsServer
} from "../src/server"

describe("core session query helpers", () => {
  it("builds client session options and one-line query client helpers", async () => {
    const data = { user: { id: "user-1" }, session: { id: "session-1" } }
    const authClient = {
      getSession: vi.fn(async () => data)
    }
    const signal = new AbortController().signal
    const params = {
      query: { fresh: true },
      fetchOptions: { credentials: "include" as const }
    }

    const options = sessionOptions(authClient as never, params as never)

    expect(options.queryKey).toBe(authQueryKeys.session)
    await expect(
      (options.queryFn as (context: { signal: AbortSignal }) => unknown)({
        signal
      })
    ).resolves.toBe(data)
    expect(authClient.getSession).toHaveBeenCalledWith({
      query: { fresh: true },
      fetchOptions: { credentials: "include", signal, throw: true }
    })

    const queryClient = {
      ensureQueryData: vi.fn(async () => data),
      prefetchQuery: vi.fn(async () => undefined),
      fetchQuery: vi.fn(async () => data)
    }

    await expect(
      ensureSession(queryClient as never, authClient as never, params as never)
    ).resolves.toBe(data)
    await expect(
      prefetchSession(
        queryClient as never,
        authClient as never,
        params as never
      )
    ).resolves.toBeUndefined()
    await expect(
      fetchSession(queryClient as never, authClient as never, params as never)
    ).resolves.toBe(data)
  })

  it("builds server session options and Server-suffixed helpers", async () => {
    const data = { user: { id: "user-2" }, session: { id: "session-2" } }
    const params = { headers: new Headers({ cookie: "sid=abc" }) }
    const auth = {
      api: {
        getSession: vi.fn(async () => data)
      }
    }

    const options = sessionOptionsServer(auth as never, params as never)

    expect(options.queryKey).toBe(authQueryKeys.session)
    await expect(
      (
        options.queryFn as unknown as (
          context: Record<string, never>
        ) => unknown
      )({})
    ).resolves.toBe(data)
    expect(auth.api.getSession).toHaveBeenCalledWith(params)

    const queryClient = {
      ensureQueryData: vi.fn(async () => data),
      prefetchQuery: vi.fn(async () => undefined),
      fetchQuery: vi.fn(async () => data)
    }

    await expect(
      ensureSessionServer(queryClient as never, auth as never, params as never)
    ).resolves.toBe(data)
    await expect(
      prefetchSessionServer(
        queryClient as never,
        auth as never,
        params as never
      )
    ).resolves.toBeUndefined()
    await expect(
      fetchSessionServer(queryClient as never, auth as never, params as never)
    ).resolves.toBe(data)
  })
})
