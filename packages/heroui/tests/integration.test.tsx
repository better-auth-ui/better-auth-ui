import { describe, expect, it } from "vitest"

// Components surfaced by the main `@better-auth-ui/heroui` entry.
const indexComponents = [
  "Auth",
  "AuthRedirect",
  "ForgotPassword",
  "ProviderButtons",
  "ResetPassword",
  "SignIn",
  "SignOut",
  "SignUp",
  "UserAvatar",
  "UserButton"
] as const

// Components and plugin factories surfaced by the
// `@better-auth-ui/heroui/plugins` entry. Plugin-internal components like
// `MagicLinkButton` and `PasskeyButton` are not re-exported — they're only
// used as `authButtons` slot contributions on the plugin objects.
const pluginsExports = [
  "MagicLink",
  "Passkeys",
  "SignInUsername",
  "LastUsedBadge",
  "UsernameField",
  "lastLoginMethodPlugin",
  "magicLinkPlugin",
  "passkeyPlugin",
  "usernamePlugin"
] as const

describe("@better-auth-ui/heroui integration", () => {
  it("should export main components", async () => {
    const module = await import("../src/index")

    for (const name of indexComponents) {
      expect(module).toHaveProperty(name)
    }
  })

  it("should have all main components as functions", async () => {
    const module = await import("../src/index")

    for (const name of indexComponents) {
      expect(typeof module[name]).toBe("function")
    }
  })

  it("should export plugin components and factories", async () => {
    const module = await import("../src/plugins")

    for (const name of pluginsExports) {
      expect(module).toHaveProperty(name)
    }
  })

  it("should have all plugin exports as functions", async () => {
    const module = await import("../src/plugins")

    for (const name of pluginsExports) {
      expect(typeof module[name]).toBe("function")
    }
  })
})
