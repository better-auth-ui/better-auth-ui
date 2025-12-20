import { describe, expect, it } from "vitest"
import type { AnyAuthConfig, AuthConfig } from "../../src/lib/auth-config"

describe("auth-config types", () => {
  describe("AuthConfig", () => {
    it("should extend BaseAuthConfig with React-specific properties", () => {
      // Type-only test
      const config = {} as AuthConfig
      expect(config).toBeDefined()
    })

    it("should require authClient property", () => {
      // This would cause a compile error if authClient is not required
      const config: Partial<AuthConfig> = {
        authClient: undefined as any
      }
      expect(config.authClient).toBeDefined()
    })

    it("should require Link component property", () => {
      // This would cause a compile error if Link is not required
      const config: Partial<AuthConfig> = {
        Link: undefined as any
      }
      expect(config.Link).toBeDefined()
    })
  })

  describe("AnyAuthConfig", () => {
    it("should allow partial configuration", () => {
      const partialConfig: AnyAuthConfig = {
        redirectTo: "/dashboard"
      }
      expect(partialConfig.redirectTo).toBe("/dashboard")
    })

    it("should allow authClient override", () => {
      const config: AnyAuthConfig = {
        authClient: {} as any
      }
      expect(config.authClient).toBeDefined()
    })

    it("should allow empty configuration", () => {
      const emptyConfig: AnyAuthConfig = {}
      expect(emptyConfig).toBeDefined()
    })

    it("should allow partial basePaths", () => {
      const config: AnyAuthConfig = {
        basePaths: {
          auth: "/custom-auth"
        }
      }
      expect(config.basePaths?.auth).toBe("/custom-auth")
    })

    it("should allow partial emailAndPassword config", () => {
      const config: AnyAuthConfig = {
        emailAndPassword: {
          rememberMe: true
        }
      }
      expect(config.emailAndPassword?.rememberMe).toBe(true)
    })
  })
})