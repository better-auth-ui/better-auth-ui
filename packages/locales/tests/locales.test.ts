import type { AuthLocale } from "@better-auth-ui/core"
import { describe, expect, it } from "vitest"
import { enUS } from "../src/en-US"

const localeModules = import.meta.glob<Record<string, AuthLocale>>(
  "../src/*.ts",
  { eager: true }
)

const otherLocales = Object.entries(localeModules)
  .filter(
    ([path]) => path !== "../src/index.ts" && !path.endsWith("-plugins.ts")
  )
  .map(([path, mod]) => {
    const locale = Object.values(mod)[0]
    if (!locale) {
      throw new Error(`Locale module at ${path} has no exported locale`)
    }
    return locale
  })
  .filter((locale) => locale.languageTag !== enUS.languageTag)

function flattenMessages(
  value: Record<string, unknown>,
  prefix = ""
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) => {
      const path = prefix ? `${prefix}.${key}` : key
      return typeof entry === "string"
        ? [[path, entry]]
        : Object.entries(
            flattenMessages(entry as Record<string, unknown>, path)
          )
    })
  )
}

function placeholders(message: string) {
  return message.match(/\{\{[^{}]+\}\}|\{[^{}]+\}/g) ?? []
}

describe("locale bundles", () => {
  it("discovers at least one non-English locale", () => {
    expect(otherLocales.length).toBeGreaterThan(0)
  })

  it.each(otherLocales)(
    "$languageTag exports complete localization trees",
    (locale) => {
      expect(Object.keys(locale.localization.auth)).toEqual(
        Object.keys(enUS.localization.auth)
      )
      expect(Object.keys(locale.localization.settings)).toEqual(
        Object.keys(enUS.localization.settings)
      )
      expect(Object.keys(locale.plugins ?? {})).toEqual(
        Object.keys(enUS.plugins ?? {})
      )
    }
  )

  it.each(otherLocales)(
    "$languageTag preserves interpolation placeholders",
    (locale) => {
      const english = flattenMessages({
        ...enUS.localization,
        plugins: enUS.plugins
      })
      const translated = flattenMessages({
        ...locale.localization,
        plugins: locale.plugins
      })

      expect(Object.keys(translated).sort()).toEqual(
        Object.keys(english).sort()
      )

      for (const [path, message] of Object.entries(english)) {
        expect(placeholders(translated[path] as string), path).toEqual(
          placeholders(message)
        )
      }
    }
  )
})
