import { describe, expect, it, vi } from "vitest"

import {
  type AdditionalField,
  fieldsWithModelValues,
  formatAdditionalFieldValue,
  parseAdditionalFieldValue,
  parseAdditionalFieldValues,
  resolveInputType
} from "../src/config/additional-fields-config"

const baseField = (overrides: Partial<AdditionalField>): AdditionalField =>
  ({
    name: "test",
    label: "Test",
    type: "string",
    ...overrides
  }) as AdditionalField

describe("model field helpers", () => {
  it("parses writable values, validates them, and omits read-only fields", async () => {
    const validate = vi.fn()
    const fields = [
      baseField({ name: "title", validate }),
      baseField({ name: "level", type: "number" }),
      baseField({ name: "internal", readOnly: true })
    ]
    const formData = new FormData()
    formData.set("title", "Engineer")
    formData.set("level", "4")
    formData.set("internal", "secret")

    await expect(parseAdditionalFieldValues(fields, formData)).resolves.toEqual(
      { title: "Engineer", level: 4 }
    )
    expect(validate).toHaveBeenCalledWith("Engineer")
  })

  it("seeds edit fields without mutating the configured fields", () => {
    const fields = [baseField({ name: "color", defaultValue: "blue" })]

    expect(fieldsWithModelValues(fields, { color: "green" })[0]).toMatchObject({
      name: "color",
      defaultValue: "green"
    })
    expect(fields[0]?.defaultValue).toBe("blue")
  })

  it("formats date-only values as local calendar dates", () => {
    const previousTimezone = process.env.TZ
    process.env.TZ = "America/Los_Angeles"

    try {
      expect(formatAdditionalFieldValue("2024-06-15")).toBe(
        new Date(2024, 5, 15).toLocaleString()
      )
    } finally {
      if (previousTimezone === undefined) delete process.env.TZ
      else process.env.TZ = previousTimezone
    }
  })
})

describe("parseAdditionalFieldValue", () => {
  describe("string", () => {
    it("returns the raw string", () => {
      const field = baseField({ type: "string" })
      expect(parseAdditionalFieldValue(field, "hello")).toBe("hello")
    })

    it("returns null for empty string (explicit clear)", () => {
      const field = baseField({ type: "string" })
      expect(parseAdditionalFieldValue(field, "")).toBeNull()
    })

    it("returns undefined for null (omitted)", () => {
      const field = baseField({ type: "string" })
      expect(parseAdditionalFieldValue(field, null)).toBeUndefined()
    })

    it("returns undefined for undefined (omitted)", () => {
      const field = baseField({ type: "string" })
      expect(parseAdditionalFieldValue(field, undefined)).toBeUndefined()
    })
  })

  describe("number", () => {
    it("parses an integer string", () => {
      const field = baseField({ type: "number" })
      expect(parseAdditionalFieldValue(field, "42")).toBe(42)
    })

    it("parses a decimal string", () => {
      const field = baseField({ type: "number" })
      expect(parseAdditionalFieldValue(field, "3.14")).toBe(3.14)
    })

    it("parses a negative number", () => {
      const field = baseField({ type: "number" })
      expect(parseAdditionalFieldValue(field, "-7")).toBe(-7)
    })

    it("parses zero", () => {
      const field = baseField({ type: "number" })
      // Empty-string short-circuits before parsing, but "0" is non-empty
      expect(parseAdditionalFieldValue(field, "0")).toBe(0)
    })

    it("returns undefined for non-numeric input", () => {
      const field = baseField({ type: "number" })
      expect(parseAdditionalFieldValue(field, "abc")).toBeUndefined()
    })

    it("returns null for empty string (explicit clear)", () => {
      const field = baseField({ type: "number" })
      expect(parseAdditionalFieldValue(field, "")).toBeNull()
    })

    it("returns undefined for null (omitted)", () => {
      const field = baseField({ type: "number" })
      expect(parseAdditionalFieldValue(field, null)).toBeUndefined()
    })
  })

  describe("boolean", () => {
    it("returns true for 'on'", () => {
      const field = baseField({ type: "boolean" })
      expect(parseAdditionalFieldValue(field, "on")).toBe(true)
    })

    it("returns true for 'true'", () => {
      const field = baseField({ type: "boolean" })
      expect(parseAdditionalFieldValue(field, "true")).toBe(true)
    })

    it("returns false for null (unchecked checkbox)", () => {
      const field = baseField({ type: "boolean" })
      expect(parseAdditionalFieldValue(field, null)).toBe(false)
    })

    it("returns false for undefined", () => {
      const field = baseField({ type: "boolean" })
      expect(parseAdditionalFieldValue(field, undefined)).toBe(false)
    })

    it("returns false for empty string", () => {
      const field = baseField({ type: "boolean" })
      expect(parseAdditionalFieldValue(field, "")).toBe(false)
    })

    it("returns false for arbitrary non-truthy strings", () => {
      const field = baseField({ type: "boolean" })
      expect(parseAdditionalFieldValue(field, "off")).toBe(false)
      expect(parseAdditionalFieldValue(field, "no")).toBe(false)
    })
  })

  describe("date", () => {
    it("parses an ISO date string", () => {
      const field = baseField({ type: "date" })
      const result = parseAdditionalFieldValue(field, "2024-06-15")
      expect(result).toBeInstanceOf(Date)
      expect((result as Date).toISOString().slice(0, 10)).toBe("2024-06-15")
    })

    it("parses an ISO datetime string", () => {
      const field = baseField({ type: "date" })
      const result = parseAdditionalFieldValue(
        field,
        "2024-06-15T12:30:00.000Z"
      )
      expect(result).toBeInstanceOf(Date)
      expect((result as Date).toISOString()).toBe("2024-06-15T12:30:00.000Z")
    })

    it("returns undefined for an invalid date string", () => {
      const field = baseField({ type: "date" })
      expect(parseAdditionalFieldValue(field, "not-a-date")).toBeUndefined()
    })

    it("returns null for empty string (explicit clear)", () => {
      const field = baseField({ type: "date" })
      expect(parseAdditionalFieldValue(field, "")).toBeNull()
    })

    it("returns undefined for null (omitted)", () => {
      const field = baseField({ type: "date" })
      expect(parseAdditionalFieldValue(field, null)).toBeUndefined()
    })
  })
})

describe("resolveInputType", () => {
  it("returns the explicit inputType when provided", () => {
    expect(
      resolveInputType(baseField({ type: "string", inputType: "textarea" }))
    ).toBe("textarea")
    expect(
      resolveInputType(baseField({ type: "number", inputType: "slider" }))
    ).toBe("slider")
    expect(
      resolveInputType(baseField({ type: "string", inputType: "select" }))
    ).toBe("select")
    expect(
      resolveInputType(baseField({ type: "string", inputType: "hidden" }))
    ).toBe("hidden")
  })

  it("defaults string to input", () => {
    expect(resolveInputType(baseField({ type: "string" }))).toBe("input")
  })

  it("defaults number to number", () => {
    expect(resolveInputType(baseField({ type: "number" }))).toBe("number")
  })

  it("defaults boolean to switch", () => {
    expect(resolveInputType(baseField({ type: "boolean" }))).toBe("switch")
  })

  it("defaults date to date", () => {
    expect(resolveInputType(baseField({ type: "date" }))).toBe("date")
  })

  it("explicit inputType overrides the type-based default", () => {
    expect(
      resolveInputType(baseField({ type: "boolean", inputType: "checkbox" }))
    ).toBe("checkbox")
    expect(
      resolveInputType(baseField({ type: "date", inputType: "datetime" }))
    ).toBe("datetime")
  })
})
