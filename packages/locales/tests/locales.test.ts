import { describe, expect, it } from "vitest"
import { deDE } from "../src/de-DE"
import { enUS } from "../src/en-US"

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
  it("exports canonical language tags and complete localization trees", () => {
    expect(enUS.languageTag).toBe("en-US")
    expect(deDE.languageTag).toBe("de-DE")
    expect(Object.keys(deDE.localization.auth)).toEqual(
      Object.keys(enUS.localization.auth)
    )
    expect(Object.keys(deDE.localization.settings)).toEqual(
      Object.keys(enUS.localization.settings)
    )
    expect(Object.keys(deDE.plugins)).toEqual(Object.keys(enUS.plugins))
  })

  it("preserves interpolation placeholders", () => {
    const english = flattenMessages({
      ...enUS.localization,
      plugins: enUS.plugins
    })
    const german = flattenMessages({
      ...deDE.localization,
      plugins: deDE.plugins
    })

    expect(Object.keys(german).sort()).toEqual(Object.keys(english).sort())

    for (const [path, message] of Object.entries(english)) {
      expect(placeholders(german[path] as string), path).toEqual(
        placeholders(message)
      )
    }
  })
})
