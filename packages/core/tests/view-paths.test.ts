import { describe, expect, it } from "vitest"
import { type AuthView, type ViewPaths, viewPaths } from "../src/lib/view-paths"

describe("viewPaths.auth", () => {
  it("should contain all built-in view paths", () => {
    expect(viewPaths.auth).toHaveProperty("signIn")
    expect(viewPaths.auth).toHaveProperty("signUp")
    expect(viewPaths.auth).toHaveProperty("forgotPassword")
    expect(viewPaths.auth).toHaveProperty("resetPassword")
    expect(viewPaths.auth).toHaveProperty("signOut")
    expect(viewPaths.auth).toHaveProperty("verifyEmail")
  })

  it("should have correct path values", () => {
    expect(viewPaths.auth.signIn).toBe("sign-in")
    expect(viewPaths.auth.signUp).toBe("sign-up")
    expect(viewPaths.auth.forgotPassword).toBe("forgot-password")
    expect(viewPaths.auth.resetPassword).toBe("reset-password")
    expect(viewPaths.auth.signOut).toBe("sign-out")
    expect(viewPaths.auth.verifyEmail).toBe("verify-email")
  })

  it("should use kebab-case for all paths", () => {
    Object.values(viewPaths.auth).forEach((path) => {
      expect(path).toMatch(/^[a-z]+(-[a-z]+)*$/)
    })
  })

  it("should not have empty path values", () => {
    Object.values(viewPaths.auth).forEach((path) => {
      expect(path.trim()).not.toBe("")
    })
  })
})

describe("authViews (derived)", () => {
  it("should be able to derive array of auth view keys", () => {
    const authViews = Object.keys(viewPaths.auth) as AuthView[]
    expect(Array.isArray(authViews)).toBe(true)
  })

  it("should contain all built-in view keys", () => {
    const authViews = Object.keys(viewPaths.auth)
    expect(authViews).toContain("signIn")
    expect(authViews).toContain("signUp")
    expect(authViews).toContain("forgotPassword")
    expect(authViews).toContain("resetPassword")
    expect(authViews).toContain("signOut")
    expect(authViews).toContain("verifyEmail")
  })

  it("should have valid AuthView type elements", () => {
    const authViews = Object.keys(viewPaths.auth) as AuthView[]
    authViews.forEach((view) => {
      expect(typeof view).toBe("string")
      expect(viewPaths.auth).toHaveProperty(view)
    })
  })
})

describe("authPaths (derived)", () => {
  it("should be able to derive array of auth path values", () => {
    const authPaths = Object.values(viewPaths.auth)
    expect(Array.isArray(authPaths)).toBe(true)
    expect(authPaths.length).toBe(6)
  })

  it("should contain all built-in path values", () => {
    const authPaths = Object.values(viewPaths.auth)
    expect(authPaths).toContain("sign-in")
    expect(authPaths).toContain("sign-up")
    expect(authPaths).toContain("forgot-password")
    expect(authPaths).toContain("reset-password")
    expect(authPaths).toContain("sign-out")
    expect(authPaths).toContain("verify-email")
  })

  it("should have no duplicates", () => {
    const authPaths = Object.values(viewPaths.auth)
    const uniquePaths = [...new Set(authPaths)]
    expect(authPaths).toEqual(uniquePaths)
  })
})

describe("viewPaths", () => {
  it("should have auth property", () => {
    expect(viewPaths).toHaveProperty("auth")
  })

  it("should maintain all built-in auth view paths", () => {
    expect(viewPaths.auth.signIn).toBe("sign-in")
    expect(viewPaths.auth.signUp).toBe("sign-up")
    expect(viewPaths.auth.forgotPassword).toBe("forgot-password")
    expect(viewPaths.auth.resetPassword).toBe("reset-password")
    expect(viewPaths.auth.signOut).toBe("sign-out")
    expect(viewPaths.auth.verifyEmail).toBe("verify-email")
  })
})

describe("type safety", () => {
  it("should allow valid AuthView types", () => {
    const validViews: AuthView[] = [
      "signIn",
      "signUp",
      "forgotPassword",
      "resetPassword",
      "signOut",
      "verifyEmail"
    ]

    validViews.forEach((view) => {
      expect(viewPaths.auth[view]).toBeDefined()
    })
  })

  it("should have correct ViewPaths structure", () => {
    const paths: ViewPaths = viewPaths
    expect(paths.auth).toBeDefined()
    expect(typeof paths.auth.signIn).toBe("string")
  })
})
