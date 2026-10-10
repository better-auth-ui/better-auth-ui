import {
  defineAuthLocale,
  localization,
  resolveAuthConfig
} from "@better-auth-ui/core"
import { organizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { usernameLocalization } from "@better-auth-ui/core/plugins/username"
import { expect, it, vi } from "vitest"
import { UsernameField } from "../src/components/auth/username/username-field"
import { organizationPlugin } from "../src/lib/auth/organization-plugin"
import { usernamePlugin } from "../src/lib/auth/username-plugin"

vi.mock("../src/components/auth/username/sign-in-username", () => ({
  SignInUsername: () => null
}))
vi.mock("../src/components/auth/username/username-field", () => ({
  UsernameField: () => null
}))
vi.mock("../src/components/auth/organization/organizations-settings", () => ({
  OrganizationsSettings: () => null
}))
vi.mock("../src/primitives/styled", () => ({
  Box: () => null,
  Txt: () => null
}))
vi.mock("../src/primitives/ui-icons", () => ({ Briefcase: () => null }))
vi.mock("../src/lib/theme-colors", () => ({ useThemeColors: () => ({}) }))

const authClient = {} as Parameters<typeof resolveAuthConfig>[0]["authClient"]

it("preserves the native username renderer after locale resolution", () => {
  const config = resolveAuthConfig({
    authClient,
    plugins: [usernamePlugin()],
    locale: defineAuthLocale({
      languageTag: "de-DE",
      localization,
      plugins: {
        username: { ...usernameLocalization, username: "Benutzername" }
      }
    })
  })
  const field = config.additionalFields.find(
    (field) => field.name === "username"
  )
  expect(field?.render).toBe(UsernameField)
  expect(field?.label).toBe("Benutzername")
})

it("resolves organization tab labels and role overrides with the locale", () => {
  const plugin = organizationPlugin({ additionalRoles: { auditor: "Auditor" } })
  const locale = defineAuthLocale({
    languageTag: "de-DE",
    localization,
    plugins: {
      organization: {
        ...organizationLocalization,
        organizations: "Organisationen",
        member: "Mitglied"
      }
    }
  })
  const config = resolveAuthConfig({ authClient, plugins: [plugin], locale })
  const resolved = config.plugins[0] as ReturnType<typeof organizationPlugin>
  expect(resolved.settingsTabs[0].label.props.label).toBe("Organisationen")
  expect(resolved.roles.member).toBe("Mitglied")
  expect(resolved.roles.auditor).toBe("Auditor")
})
