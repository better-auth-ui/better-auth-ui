import { describe, expect, it } from "vitest"
import {
  defaultConfig,
  type AuthConfig,
  type EmailAndPasswordConfig
} from "../src/lib/auth-config"
import { basePaths } from "../src/lib/base-paths"
import { localization } from "../src/lib/localization"
import { viewPaths } from "../src/lib/view-paths"

describe("auth-config", () => {
  describe("EmailAndPasswordConfig type", () => {
    it("should allow valid email and password configuration", () => {
      const config: EmailAndPasswordConfig = {
        enabled: true,
        forgotPassword: true,
        confirmPassword: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        rememberMe: true,
        requireEmailVerification: false
      }

      expect(config.enabled).toBe(true)
      expect(config.forgotPassword).toBe(true)
      expect(config.confirmPassword).toBe(true)
      expect(config.minPasswordLength).toBe(8)
      expect(config.maxPasswordLength).toBe(128)
      expect(config.rememberMe).toBe(true)
      expect(config.requireEmailVerification).toBe(false)
    })

    it("should work with minimal configuration", () => {
      const config: EmailAndPasswordConfig = {
        enabled: true,
        forgotPassword: false
      }

      expect(config.enabled).toBe(true)
      expect(config.forgotPassword).toBe(false)
    })

    it("should allow optional fields to be undefined", () => {
      const config: EmailAndPasswordConfig = {
        enabled: false,
        forgotPassword: true
      }

      expect(config.confirmPassword).toBeUndefined()
      expect(config.minPasswordLength).toBeUndefined()
      expect(config.maxPasswordLength).toBeUndefined()
      expect(config.rememberMe).toBeUndefined()
      expect(config.requireEmailVerification).toBeUndefined()
    })
  })

  describe("AuthConfig type", () => {
    it("should allow complete auth configuration", () => {
      const config: AuthConfig = {
        basePaths: {
          auth: "/auth",
          settings: "/settings",
          organization: "/organization"
        },
        baseURL: "https://example.com",
        emailAndPassword: {
          enabled: true,
          forgotPassword: true,
          minPasswordLength: 10,
          maxPasswordLength: 256
        },
        localization: localization,
        magicLink: true,
        redirectTo: "/dashboard",
        socialProviders: ["google", "github"],
        viewPaths: viewPaths,
        toast: {
          error: () => {},
          success: () => {},
          info: () => {}
        },
        navigate: (path: string) => {},
        replace: (path: string) => {}
      }

      expect(config.basePaths.auth).toBe("/auth")
      expect(config.baseURL).toBe("https://example.com")
      expect(config.redirectTo).toBe("/dashboard")
      expect(config.socialProviders).toContain("google")
      expect(config.magicLink).toBe(true)
    })
  })

  describe("defaultConfig", () => {
    it("should export a valid default configuration", () => {
      expect(defaultConfig).toBeDefined()
      expect(typeof defaultConfig).toBe("object")
    })

    it("should have correct basePaths defaults", () => {
      expect(defaultConfig.basePaths).toEqual(basePaths)
      expect(defaultConfig.basePaths.auth).toBe("/auth")
      expect(defaultConfig.basePaths.settings).toBe("/settings")
      expect(defaultConfig.basePaths.organization).toBe("/organization")
    })

    it("should have empty baseURL by default", () => {
      expect(defaultConfig.baseURL).toBe("")
    })

    it("should have correct emailAndPassword defaults", () => {
      expect(defaultConfig.emailAndPassword).toBeDefined()
      expect(defaultConfig.emailAndPassword?.enabled).toBe(true)
      expect(defaultConfig.emailAndPassword?.forgotPassword).toBe(true)
      expect(defaultConfig.emailAndPassword?.rememberMe).toBe(false)
      expect(defaultConfig.emailAndPassword?.minPasswordLength).toBe(8)
      expect(defaultConfig.emailAndPassword?.maxPasswordLength).toBe(128)
    })

    it("should have root path as default redirectTo", () => {
      expect(defaultConfig.redirectTo).toBe("/")
    })

    it("should have default viewPaths", () => {
      expect(defaultConfig.viewPaths).toEqual(viewPaths)
    })

    it("should have default localization", () => {
      expect(defaultConfig.localization).toEqual(localization)
    })

    it("should have navigate function", () => {
      expect(typeof defaultConfig.navigate).toBe("function")
    })

    it("should have replace function", () => {
      expect(typeof defaultConfig.replace).toBe("function")
    })

    it("should have toast configuration with all methods", () => {
      expect(defaultConfig.toast).toBeDefined()
      expect(typeof defaultConfig.toast.error).toBe("function")
      expect(typeof defaultConfig.toast.success).toBe("function")
      expect(typeof defaultConfig.toast.info).toBe("function")
    })

    it("should have navigate function that sets window.location.href", () => {
      const originalHref = window.location.href
      
      // Mock window.location.href
      delete (window as any).location
      window.location = { href: "" } as any

      defaultConfig.navigate("/test-path")
      expect(window.location.href).toBe("/test-path")

      // Restore
      window.location.href = originalHref
    })

    it("should have replace function that calls window.location.replace", () => {
      const replaceMock = vi.fn()
      const originalReplace = window.location.replace
      window.location.replace = replaceMock

      defaultConfig.replace("/test-path")
      expect(replaceMock).toHaveBeenCalledWith("/test-path")

      // Restore
      window.location.replace = originalReplace
    })
  })

  describe("configuration merging", () => {
    it("should allow partial overrides of default config", () => {
      const customConfig: Partial<AuthConfig> = {
        redirectTo: "/custom-dashboard",
        baseURL: "https://api.example.com"
      }

      const merged = { ...defaultConfig, ...customConfig }

      expect(merged.redirectTo).toBe("/custom-dashboard")
      expect(merged.baseURL).toBe("https://api.example.com")
      expect(merged.basePaths).toEqual(defaultConfig.basePaths)
    })

    it("should handle deep merging of emailAndPassword config", () => {
      const customConfig: Partial<AuthConfig> = {
        emailAndPassword: {
          ...defaultConfig.emailAndPassword!,
          minPasswordLength: 12,
          confirmPassword: true
        }
      }

      const merged = { ...defaultConfig, ...customConfig }

      expect(merged.emailAndPassword?.minPasswordLength).toBe(12)
      expect(merged.emailAndPassword?.confirmPassword).toBe(true)
      expect(merged.emailAndPassword?.enabled).toBe(true)
    })
  })
})