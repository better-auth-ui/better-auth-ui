import type { BetterFetchOption } from "better-auth/client"
import { describe, expect, it, vi } from "vitest"
import {
  authQueryRetryDelay,
  createAuthQueryFetchOptions,
  createAuthQueryRetryOptions,
  isRetryableAuthQueryError,
  isSessionNotFreshError
} from "../src/lib/auth-query-retry"

type ErrorContext = Parameters<NonNullable<BetterFetchOption["onError"]>>[0]

describe("auth query retry policy", () => {
  it.each([408, 429, 500, 502, 503, 504])(
    "retries transient HTTP status %s",
    (status) => {
      expect(isRetryableAuthQueryError({ status })).toBe(true)
    }
  )

  it.each([400, 401, 403, 404, 409, 422, 501])(
    "does not retry permanent HTTP status %s",
    (status) => {
      expect(isRetryableAuthQueryError({ status })).toBe(false)
    }
  )

  it("retries failures without an HTTP response", () => {
    expect(isRetryableAuthQueryError(new TypeError("Failed to fetch"))).toBe(
      true
    )
  })

  it("recognizes fresh-session failures across Better Fetch error shapes", () => {
    expect(isSessionNotFreshError({ code: "SESSION_NOT_FRESH" })).toBe(true)
    expect(
      isSessionNotFreshError({ error: { code: "SESSION_NOT_FRESH" } })
    ).toBe(true)
    expect(isSessionNotFreshError({ code: "UNAUTHORIZED" })).toBe(false)
  })

  it("stops after three client retries and never retries on the server", () => {
    const clientOptions = createAuthQueryRetryOptions(() => false)
    const serverOptions = createAuthQueryRetryOptions(() => true)
    const error = { status: 503 }

    expect(clientOptions.retry(2, error)).toBe(true)
    expect(clientOptions.retry(3, error)).toBe(false)
    expect(serverOptions.retry(0, error)).toBe(false)
  })

  it("uses exponential backoff unless the server supplies a delay", () => {
    expect(authQueryRetryDelay(2, new Error("Unavailable"))).toBe(4000)
    expect(
      authQueryRetryDelay(2, {
        status: 429,
        retryAfterMs: 12_000
      })
    ).toBe(12_000)
  })
})

describe("createAuthQueryFetchOptions", () => {
  it("preserves Retry-After without replacing existing handlers or plugins", async () => {
    const onError = vi.fn()
    const existingPlugin = {
      id: "existing",
      name: "Existing plugin"
    }
    const fetchOptions = createAuthQueryFetchOptions(
      { onError, plugins: [existingPlugin] },
      new AbortController().signal
    )
    const context = {
      response: new Response(null, {
        status: 429,
        statusText: "Too Many Requests",
        headers: { "Retry-After": "12" }
      }),
      request: {},
      error: new Error("Too many requests")
    } as ErrorContext

    expect(fetchOptions.onError).toBe(onError)
    expect(fetchOptions.plugins?.[0]).toBe(existingPlugin)

    const retryPlugin = fetchOptions.plugins?.at(-1)

    await expect(retryPlugin?.hooks?.onError?.(context)).rejects.toMatchObject({
      status: 429,
      retryAfterMs: 12_000
    })
  })

  it("falls back to Better Auth's retry header when Retry-After is invalid", async () => {
    const fetchOptions = createAuthQueryFetchOptions(
      undefined,
      new AbortController().signal
    )
    const context = {
      response: new Response(null, {
        status: 503,
        headers: {
          "Retry-After": "invalid",
          "X-Retry-After": "4"
        }
      }),
      request: {},
      error: new Error("Unavailable")
    } as ErrorContext

    const retryPlugin = fetchOptions.plugins?.at(-1)

    await expect(retryPlugin?.hooks?.onError?.(context)).rejects.toMatchObject({
      status: 503,
      retryAfterMs: 4000
    })
  })
})
