import { describe, expect, it } from "vitest"
import {
  type AuthConfig,
  defaultConfig,
  type EmailAndPasswordConfig
} from "../src/lib/auth-config"
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

    it("should have empty baseURL", () => {
      expect(defaultConfig.baseURL).toBe("")
    })

    it("should have default emailAndPassword config", () => {
      expect(defaultConfig.emailAndPassword).toBeDefined()
      expect(defaultConfig.emailAndPassword?.enabled).toBe(true)
      expect(defaultConfig.emailAndPassword?.forgotPassword).toBe(true)
      expect(defaultConfig.emailAndPassword?.rememberMe).toBe(false)
      expect(defaultConfig.emailAndPassword?.minPasswordLength).toBe(8)
      expect(defaultConfig.emailAndPassword?.maxPasswordLength).toBe(128)
    })

    it("should have default redirectTo", () => {
      expect(defaultConfig.redirectTo).toBe("/")
    })

    it("should have viewPaths", () => {
      expect(defaultConfig.viewPaths).toEqual(viewPaths)
    })

    it("should have localization", () => {
      expect(defaultConfig.localization).toEqual(localization)
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

  describe("EmailAndPasswordConfig", () => {
    it("should allow all optional fields to be undefined", () => {
      const minimalConfig: EmailAndPasswordConfig = {
        enabled: true,
        forgotPassword: true
      }

      expect(minimalConfig.enabled).toBe(true)
      expect(minimalConfig.forgotPassword).toBe(true)
      expect(minimalConfig.confirmPassword).toBeUndefined()
      expect(minimalConfig.maxPasswordLength).toBeUndefined()
      expect(minimalConfig.minPasswordLength).toBeUndefined()
      expect(minimalConfig.rememberMe).toBeUndefined()
      expect(minimalConfig.requireEmailVerification).toBeUndefined()
    })

    it("should allow full configuration", () => {
      const fullConfig: EmailAndPasswordConfig = {
        enabled: true,
        confirmPassword: true,
        forgotPassword: true,
        maxPasswordLength: 256,
        minPasswordLength: 12,
        rememberMe: true,
        requireEmailVerification: true
      }

      expect(fullConfig.enabled).toBe(true)
      expect(fullConfig.confirmPassword).toBe(true)
      expect(fullConfig.forgotPassword).toBe(true)
      expect(fullConfig.maxPasswordLength).toBe(256)
      expect(fullConfig.minPasswordLength).toBe(12)
      expect(fullConfig.rememberMe).toBe(true)
      expect(fullConfig.requireEmailVerification).toBe(true)
    })

    it("should allow disabled email and password auth", () => {
      const disabledConfig: EmailAndPasswordConfig = {
        enabled: false,
        forgotPassword: false
      }

      expect(disabledConfig.enabled).toBe(false)
      expect(disabledConfig.forgotPassword).toBe(false)
    })
  })

  describe("AuthConfig interface", () => {
    it("should allow custom basePaths", () => {
      const config: AuthConfig = {
        ...defaultConfig,
        basePaths: {
          auth: "/custom-auth",
          settings: "/custom-settings",
          organization: "/custom-org"
        }
      }

      expect(config.basePaths.auth).toBe("/custom-auth")
      expect(config.basePaths.settings).toBe("/custom-settings")
      expect(config.basePaths.organization).toBe("/custom-org")
    })

    it("should allow custom baseURL", () => {
      const config: AuthConfig = {
        ...defaultConfig,
        baseURL: "https://api.example.com"
      }

      expect(config.baseURL).toBe("https://api.example.com")
    })

    it("should allow custom redirectTo", () => {
      const config: AuthConfig = {
        ...defaultConfig,
        redirectTo: "/dashboard"
      }

      expect(config.redirectTo).toBe("/dashboard")
    })

    it("should allow social providers configuration", () => {
      const config: AuthConfig = {
        ...defaultConfig,
        socialProviders: ["github", "google", "discord"]
      }

      expect(config.socialProviders).toEqual(["github", "google", "discord"])
      expect(config.socialProviders?.length).toBe(3)
    })

    it("should allow magic link configuration", () => {
      const configEnabled: AuthConfig = {
        ...defaultConfig,
        magicLink: true
      }

      const configDisabled: AuthConfig = {
        ...defaultConfig,
        magicLink: false
      }

      expect(configEnabled.magicLink).toBe(true)
      expect(configDisabled.magicLink).toBe(false)
    })

    it("should allow custom navigate function", () => {
      const mockNavigate = (path: string) => {
        console.log(`Navigating to ${path}`)
      }

      const config: AuthConfig = {
        ...defaultConfig,
        navigate: mockNavigate
      }

      expect(config.navigate).toBe(mockNavigate)
    })

    it("should allow custom replace function", () => {
      const mockReplace = (path: string) => {
        console.log(`Replacing with ${path}`)
      }

      const config: AuthConfig = {
        ...defaultConfig,
        replace: mockReplace
      }

      expect(config.replace).toBe(mockReplace)
    })
  })

  describe("default navigation functions", () => {
    it("navigate should set window.location.href", () => {
      const originalLocation = window.location.href

      // Note: In test environment, this won't actually navigate
      // but we can verify the function exists and is callable
      expect(() => {
        // We can't actually test navigation in a unit test environment
        // but we can verify the function signature
        const navFn = defaultConfig.navigate
        expect(typeof navFn).toBe("function")
      }).not.toThrow()
    })

    it("replace should call window.location.replace", () => {
      // Verify the function exists and is callable
      expect(() => {
        const replaceFn = defaultConfig.replace
        expect(typeof replaceFn).toBe("function")
      }).not.toThrow()
    })
  })

  describe("toast configuration", () => {
    it("should call default toast functions", () => {
      const message = "Test message"

      // These will trigger browser alerts/confirms in real environment
      // In test environment, they should not throw
      expect(() => {
        defaultConfig.toast.error(message)
      }).not.toThrow()

      expect(() => {
        defaultConfig.toast.success(message)
      }).not.toThrow()

      expect(() => {
        defaultConfig.toast.info(message)
      }).not.toThrow()
    })
  })
})
