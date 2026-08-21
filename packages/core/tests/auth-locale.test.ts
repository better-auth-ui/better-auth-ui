import { describe, expect, it } from "vitest"
import {
  createAuthPlugin,
  deepmerge,
  defaultAuthLocale,
  defineAuthLocale,
  localization,
  matchAuthLocale,
  resolveAuthConfig
} from "../src"
import { organizationPlugin } from "../src/plugins/organization"
import { usernamePlugin } from "../src/plugins/username"

const germanLocale = defineAuthLocale({
  languageTag: "de-DE",
  direction: "ltr",
  localization: deepmerge(localization, {
    auth: { signIn: "Anmelden", signOut: "Abmelden" }
  }),
  plugins: {
    organization: {
      admin: "Administrator",
      member: "Mitglied",
      organizations: "Organisationen",
      owner: "Inhaber"
    },
    test: {
      description: "Beschreibung",
      label: "Bezeichnung"
    },
    username: {
      displayUsername: "Anzeigename",
      displayUsernamePlaceholder: "Anzeigename",
      username: "Benutzername",
      usernamePlaceholder: "Benutzername"
    }
  }
})

describe("matchAuthLocale", () => {
  it("uses quality values and exact language tags", () => {
    expect(
      matchAuthLocale({
        requested: "de-DE;q=0.9, en-US;q=0.4",
        supported: [defaultAuthLocale, germanLocale],
        fallback: defaultAuthLocale
      })
    ).toBe(germanLocale)
  })

  it("matches a regional request to an imported base language", () => {
    expect(
      matchAuthLocale({
        requested: ["de-CH"],
        supported: [defaultAuthLocale, germanLocale],
        fallback: defaultAuthLocale
      })
    ).toBe(germanLocale)
  })

  it("returns the fallback for invalid and unsupported languages", () => {
    expect(
      matchAuthLocale({
        requested: "not_a_locale, fr-FR;q=0.8",
        supported: [defaultAuthLocale, germanLocale],
        fallback: defaultAuthLocale
      })
    ).toBe(defaultAuthLocale)
  })

  it("ignores invalid quality values", () => {
    expect(
      matchAuthLocale({
        requested: "de-DE;q=2, en-US;Q=0.8",
        supported: [defaultAuthLocale, germanLocale],
        fallback: germanLocale
      })
    ).toBe(defaultAuthLocale)
  })
})

describe("resolveAuthConfig localization", () => {
  const testPlugin = createAuthPlugin(
    "test",
    (options: { localization?: { label?: string } } = {}) => ({
      localization: {
        description: "Description",
        label: "Label",
        ...options.localization
      }
    })
  )

  it("applies locale messages before consumer overrides", () => {
    const plugin = testPlugin({ localization: { label: "Custom label" } })
    const config = resolveAuthConfig({
      authClient: {},
      locale: germanLocale,
      localization: { auth: { signIn: "Bei Acme anmelden" } },
      plugins: [plugin]
    })

    expect(config.localization.auth.signIn).toBe("Bei Acme anmelden")
    expect(config.localization.auth.signOut).toBe("Abmelden")
    expect(config.plugins[0]?.localization).toEqual({
      description: "Beschreibung",
      label: "Custom label"
    })
    expect(plugin.localization).toEqual({
      description: "Description",
      label: "Custom label"
    })
  })

  it("recomputes plugin values derived from localization", () => {
    const config = resolveAuthConfig({
      authClient: {},
      locale: germanLocale,
      plugins: [usernamePlugin({ displayUsername: true }), organizationPlugin()]
    })
    const username = config.plugins.find((plugin) => plugin.id === "username")
    const organization = config.plugins.find(
      (plugin) => plugin.id === "organization"
    )

    expect(username?.additionalFields?.map((field) => field.label)).toEqual([
      "Benutzername",
      "Anzeigename"
    ])
    expect(organization).toMatchObject({
      roles: {
        admin: "Administrator",
        member: "Mitglied",
        owner: "Inhaber"
      }
    })
  })
})
