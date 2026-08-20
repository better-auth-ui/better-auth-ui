import { describe, expect, it } from "vitest"
import { getOrganizationCardKey } from "../../src/lib/auth-plugin"

describe("getOrganizationCardKey", () => {
  it("keeps component identities stable when display names match", () => {
    const FirstCard = () => null
    const SecondCard = () => null
    FirstCard.displayName = "OrganizationCard"
    SecondCard.displayName = "OrganizationCard"

    const firstKey = getOrganizationCardKey("api-key", FirstCard)
    const secondKey = getOrganizationCardKey("api-key", SecondCard)

    expect(firstKey).toBe(getOrganizationCardKey("api-key", FirstCard))
    expect(secondKey).toBe(getOrganizationCardKey("api-key", SecondCard))
    expect(firstKey).not.toBe(secondKey)
    expect(getOrganizationCardKey("billing", FirstCard)).not.toBe(firstKey)
  })
})
