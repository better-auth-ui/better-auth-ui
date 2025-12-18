import { describe, expect, it } from "vitest"

const componentNames = [
  "SignIn",
  "SignUp",
  "SignOut",
  "ForgotPassword",
  "ResetPassword",
  "MagicLink",
  "Auth",
  "ProviderButtons",
  "MagicLinkButton",
  "UserAvatar",
  "UserButton"
] as const

describe("@better-auth-ui/heroui integration", () => {
  it("should export main components", async () => {
    const module = await import("../src/index")

    for (const name of componentNames) {
      expect(module).toHaveProperty(name)
    }
  })

  it("should have all components as functions", async () => {
    const module = await import("../src/index")

    for (const name of componentNames) {
      expect(typeof module[name]).toBe("function")
    }
  })
})
