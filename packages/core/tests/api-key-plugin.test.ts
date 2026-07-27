import { describe, expect, it } from "vitest"
import {
  API_KEY_EXPIRATION_SECONDS_PER_DAY,
  apiKeyExpirationDaysToSeconds,
  apiKeyPlugin,
  DEFAULT_API_KEY_EXPIRATION_INTERVALS,
  resolveApiKeyExpirationOptions
} from "../src/plugins"

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
})
