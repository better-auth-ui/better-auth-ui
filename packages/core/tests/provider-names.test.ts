import { socialProviderList } from "better-auth/social-providers"
import { describe, expect, it } from "vitest"
import { getProviderId } from "../src/config/social-provider-config"
import { getProviderName, providerNames } from "../src/lib/provider-names"

describe("providerNames", () => {
  it("should contain all expected social providers", () => {
    socialProviderList.forEach((provider) => {
      expect(providerNames).toHaveProperty(provider)
      expect(typeof providerNames[provider]).toBe("string")
      expect(providerNames[provider].length).toBeGreaterThan(0)
    })
  })

  it("should have correct display names for common providers", () => {
    expect(providerNames.github).toBe("GitHub")
    expect(providerNames.google).toBe("Google")
    expect(providerNames.facebook).toBe("Facebook")
    expect(providerNames.apple).toBe("Apple")
    expect(providerNames.microsoft).toBe("Microsoft")
  })

  it("should have correct display names for specialized providers", () => {
    expect(providerNames.huggingface).toBe("Hugging Face")
    expect(providerNames.twitter).toBe("X")
    expect(providerNames.linkedin).toBe("LinkedIn")
  })

  it("should not have empty display names", () => {
    Object.values(providerNames).forEach((name) => {
      expect(name.trim()).not.toBe("")
    })
  })
})

describe("getProviderName", () => {
  describe("known providers", () => {
    it("should return correct display name for github", () => {
      expect(getProviderName("github")).toBe("GitHub")
    })

    it("should return correct display name for google", () => {
      expect(getProviderName("google")).toBe("Google")
    })

    it("should return correct display name for twitter (X)", () => {
      expect(getProviderName("twitter")).toBe("X")
    })

    it("should return correct display name for huggingface", () => {
      expect(getProviderName("huggingface")).toBe("Hugging Face")
    })

    it("should return correct display name for all registered providers", () => {
      Object.keys(providerNames).forEach((provider) => {
        const displayName = getProviderName(provider)
        expect(displayName).toBe(providerNames[provider])
      })
    })
  })

  describe("unknown providers", () => {
    it("should capitalize first letter of unknown provider", () => {
      expect(getProviderName("unknown")).toBe("Unknown")
    })

    it("uses custom provider labels and IDs", () => {
      const provider = { id: "acme-sso", label: "Acme ID" }

      expect(getProviderId(provider)).toBe("acme-sso")
      expect(getProviderName(provider)).toBe("Acme ID")
    })
  })
})
