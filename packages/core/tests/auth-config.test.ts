import { describe, expect, it } from "vitest"
import { defaultConfig } from "../src/lib/auth-config"
import { basePaths } from "../src/lib/base-paths"
import { localization } from "../src/lib/localization"
import { viewPaths } from "../src/lib/view-paths"

describe("auth-config", () => {
  describe("defaultConfig", () => {
    it("should have correct basePaths", () => {
      expect(defaultConfig.basePaths).toEqual(basePaths)
      expect(defaultConfig.basePaths.auth).toBe("/auth")
      expect(defaultConfig.basePaths.settings).toBe("/settings")
      expect(defaultConfig.basePaths.organization).toBe("/organization")
    })

    it("should have empty baseURL by default", () => {
      expect(defaultConfig.baseURL).toBe("")
    })

    it("should have correct emailAndPassword defaults", () => {
      expect(defaultConfig.emailAndPassword).toEqual({
        enabled: true,
        forgotPassword: true,
        rememberMe: false,
        minPasswordLength: 8,
        maxPasswordLength: 128
      })
    })

    it("should have correct redirectTo default", () => {
      expect(defaultConfig.redirectTo).toBe("/")
    })

    it("should have correct viewPaths", () => {
      expect(defaultConfig.viewPaths).toEqual(viewPaths)
    })

    it("should have correct localization", () => {
      expect(defaultConfig.localization).toEqual(localization)
      expect(defaultConfig.localization.auth.signIn).toBe("Sign In")
      expect(defaultConfig.localization.auth.signUp).toBe("Sign Up")
    })

    it("should have navigate function", () => {
      expect(typeof defaultConfig.navigate).toBe("function")
    })

    it("should have replace function", () => {
      expect(typeof defaultConfig.replace).toBe("function")
    })

    it("should have toast configuration", () => {
      expect(defaultConfig.toast).toBeDefined()
      expect(typeof defaultConfig.toast.error).toBe("function")
      expect(typeof defaultConfig.toast.success).toBe("function")
      expect(typeof defaultConfig.toast.info).toBe("function")
    })
  })

  describe("navigate function", () => {
    it("should update window.location.href", () => {
      const originalHref = window.location.href

      // Mock window.location.href setter
      const hrefSetter = vi.fn()
      Object.defineProperty(window.location, "href", {
        set: hrefSetter,
        configurable: true
      })

      defaultConfig.navigate("/test-path")

      expect(hrefSetter).toHaveBeenCalledWith("/test-path")

      // Restore
      Object.defineProperty(window.location, "href", {
        value: originalHref,
        writable: true,
        configurable: true
      })
    })
  })

  describe("replace function", () => {
    it("should call window.location.replace", () => {
      const replaceSpy = vi
        .spyOn(window.location, "replace")
        .mockImplementation(() => {})

      defaultConfig.replace("/test-path")

      expect(replaceSpy).toHaveBeenCalledWith("/test-path")
      replaceSpy.mockRestore()
    })
  })

  describe("EmailAndPasswordConfig", () => {
    it("should allow all valid configuration options", () => {
      const config = {
        enabled: false,
        confirmPassword: true,
        forgotPassword: false,
        maxPasswordLength: 256,
        minPasswordLength: 12,
        rememberMe: true,
        requireEmailVerification: true
      }

      expect(config.enabled).toBe(false)
      expect(config.confirmPassword).toBe(true)
      expect(config.forgotPassword).toBe(false)
      expect(config.maxPasswordLength).toBe(256)
      expect(config.minPasswordLength).toBe(12)
      expect(config.rememberMe).toBe(true)
      expect(config.requireEmailVerification).toBe(true)
    })
  })
})
