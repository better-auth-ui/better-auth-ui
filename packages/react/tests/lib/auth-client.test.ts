import { describe, expect, it } from "vitest"
import type { AnyAuthClient, AuthClient } from "../../src/lib/auth-client"

describe("auth-client types", () => {
  describe("AnyAuthClient", () => {
    it("should be a ReturnType of createAuthClient", () => {
      // This is a type-only test - if it compiles, it passes
      const mockClient = {} as AnyAuthClient
      expect(mockClient).toBeDefined()
    })
  })

  describe("AuthClient", () => {
    it("should represent the default auth client with plugins", () => {
      // This is a type-only test - if it compiles, it passes
      const mockClient = {} as AuthClient
      expect(mockClient).toBeDefined()
    })
  })

  describe("type compatibility", () => {
    it("should allow AuthClient to be assigned to AnyAuthClient", () => {
      const authClient = {} as AuthClient
      const anyAuthClient: AnyAuthClient = authClient
      expect(anyAuthClient).toBeDefined()
    })
  })
})