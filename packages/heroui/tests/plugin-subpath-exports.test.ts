import { describe, expect, it } from "vitest"
import * as apiKey from "../src/plugins/api-key"
import * as deleteUser from "../src/plugins/delete-user"
import * as magicLink from "../src/plugins/magic-link"
import * as multiSession from "../src/plugins/multi-session"
import * as organization from "../src/plugins/organization"
import * as passkey from "../src/plugins/passkey"
import * as theme from "../src/plugins/theme"
import * as username from "../src/plugins/username"

describe("HeroUI plugin subpath exports", () => {
  it("publishes plugin-specific components and plugin factories from scoped entrypoints", () => {
    expect(apiKey).toHaveProperty("ApiKeys")
    expect(apiKey).toHaveProperty("OrganizationApiKeys")
    expect(apiKey).toHaveProperty("apiKeyPlugin")

    expect(deleteUser).toHaveProperty("DangerZone")
    expect(deleteUser).toHaveProperty("DeleteAccount")
    expect(deleteUser).toHaveProperty("deleteUserPlugin")

    expect(magicLink).toHaveProperty("MagicLink")
    expect(magicLink).toHaveProperty("magicLinkPlugin")

    expect(multiSession).toHaveProperty("ManageAccounts")
    expect(multiSession).toHaveProperty("SwitchAccountSubmenu")
    expect(multiSession).toHaveProperty("multiSessionPlugin")

    expect(organization).toHaveProperty("OrganizationSwitcher")
    expect(organization).toHaveProperty("OrganizationSettings")
    expect(organization).toHaveProperty("organizationPlugin")

    expect(passkey).toHaveProperty("PasskeyButton")
    expect(passkey).toHaveProperty("Passkeys")
    expect(passkey).toHaveProperty("passkeyPlugin")

    expect(theme).toHaveProperty("Appearance")
    expect(theme).toHaveProperty("ThemeToggleItem")
    expect(theme).toHaveProperty("themePlugin")

    expect(username).toHaveProperty("SignInUsername")
    expect(username).toHaveProperty("UsernameField")
    expect(username).toHaveProperty("usernamePlugin")
  })

  it("keeps PasskeyButton scoped to the passkey subpath", async () => {
    const aggregate = await import("../src/plugins")

    expect(passkey).toHaveProperty("PasskeyButton")
    expect(aggregate).not.toHaveProperty("PasskeyButton")
  })
})
