import { skipToken } from "@tanstack/query-core"
import { describe, expect, it, vi } from "vitest"
import {
  API_KEY_EXPIRATION_SECONDS_PER_DAY,
  apiKeyExpirationDaysToSeconds,
  apiKeyPlugin,
  apiKeyQueryKeys,
  DEFAULT_API_KEY_EXPIRATION_INTERVALS,
  getApiKeyOptions,
  resolveApiKeyExpirationOptions
} from "../src/plugins/api-key"

describe("apiKeyPlugin", () => {
  it("offers expiring and non-expiring keys by default", () => {
    expect(apiKeyPlugin()).toMatchObject({
      id: "apiKey",
      organization: false,
      keyExpiration: {
        intervals: [...DEFAULT_API_KEY_EXPIRATION_INTERVALS],
        defaultInterval: 30,
        allowNever: true
      }
    })
  })

  it("supports opting out of the expiration control", () => {
    expect(apiKeyPlugin({ keyExpiration: false }).keyExpiration).toBe(false)
  })

  it("normalizes lifecycle configuration", () => {
    const configurations = [
      { id: "personal", label: "Personal", organization: false },
      { id: "service", label: "Service", organization: true }
    ]
    const permissions = [{ resource: "project", actions: ["read", "write"] }]

    expect(
      apiKeyPlugin({ configurations, permissions, pageSize: 7 })
    ).toMatchObject({ configurations, permissions, pageSize: 7 })
    expect(apiKeyPlugin({ pageSize: 0 }).pageSize).toBe(1)
    expect(apiKeyPlugin({ pageSize: Number.NaN }).pageSize).toBe(10)
    expect(apiKeyPlugin({ pageSize: Number.POSITIVE_INFINITY }).pageSize).toBe(
      10
    )
  })

  it("normalizes custom intervals and selects an available default", () => {
    expect(
      resolveApiKeyExpirationOptions({
        intervals: [7, 30, 7, Number.NaN, 0, -1],
        defaultInterval: 90,
        allowNever: false
      })
    ).toEqual({
      intervals: [7, 30],
      defaultInterval: 7,
      allowNever: false
    })
  })

  it("keeps Never selected when it is allowed", () => {
    expect(
      resolveApiKeyExpirationOptions({
        intervals: [7],
        defaultInterval: null
      })
    ).toEqual({
      intervals: [7],
      defaultInterval: null,
      allowNever: true
    })
  })

  it("disables an empty expiration control without a Never option", () => {
    expect(
      resolveApiKeyExpirationOptions({
        intervals: [],
        allowNever: false
      })
    ).toBe(false)
  })

  it("converts configured days to Better Auth seconds", () => {
    expect(apiKeyExpirationDaysToSeconds(30)).toBe(
      30 * API_KEY_EXPIRATION_SECONDS_PER_DAY
    )
  })

  it("gets one API key with a user-scoped detail query", async () => {
    const get = vi.fn(async () => ({ id: "key-1", name: "Deploy" }))
    const authClient = { apiKey: { get } }
    const params = {
      query: { configId: "service", id: "key-1" },
      fetchOptions: { credentials: "include" as const }
    }
    const options = getApiKeyOptions(
      authClient as never,
      "user-1",
      params as never
    )
    const signal = new AbortController().signal

    expect(options.queryKey).toEqual(
      apiKeyQueryKeys.detail("user-1", params.query)
    )
    await expect(
      (options.queryFn as (context: { signal: AbortSignal }) => unknown)({
        signal
      })
    ).resolves.toEqual({ id: "key-1", name: "Deploy" })
    expect(get).toHaveBeenCalledWith({
      query: params.query,
      fetchOptions: expect.objectContaining({
        credentials: "include",
        signal,
        throw: true
      })
    })
    expect(getApiKeyOptions(authClient as never).queryFn).toBe(skipToken)
    expect(getApiKeyOptions(authClient as never, "user-1").queryFn).toBe(
      skipToken
    )
  })
})
