import { describe, expect, it } from "vitest"
import {
  getFormFieldErrorMessage,
  validateAbsoluteUrl,
  validateAbsoluteUrlList,
  validateEmailAddress,
  validateMatchingValue,
  validateMinimumItems,
  validateStringLength
} from "../src/lib/form-validation"

describe("form validation", () => {
  it("validates required and bounded strings after trimming", () => {
    expect(
      validateStringLength("   ", {
        requiredMessage: "Required",
        trim: true
      })
    ).toEqual({ message: "Required" })
    expect(
      validateStringLength("short", {
        minLength: 8,
        minLengthMessage: "Too short"
      })
    ).toEqual({ message: "Too short" })
    expect(
      validateStringLength("valid value", {
        maxLength: 20,
        minLength: 8
      })
    ).toBeUndefined()
  })

  it("rejects malformed email addresses", () => {
    const messages = { invalidMessage: "Invalid", requiredMessage: "Required" }

    expect(validateEmailAddress("", messages)).toEqual({ message: "Required" })
    expect(validateEmailAddress("name@example", messages)).toEqual({
      message: "Invalid"
    })
    expect(validateEmailAddress("name@example.com", messages)).toBeUndefined()
  })

  it("validates matching values and minimum collection sizes", () => {
    expect(validateMatchingValue("one", "two", "Mismatch")).toEqual({
      message: "Mismatch"
    })
    expect(validateMatchingValue("same", "same", "Mismatch")).toBeUndefined()
    expect(validateMinimumItems([], 1, "Choose one")).toEqual({
      message: "Choose one"
    })
    expect(validateMinimumItems(["member"], 1, "Choose one")).toBeUndefined()
  })

  it("validates single URLs and newline-delimited URL lists", () => {
    const options = {
      allowedProtocols: ["https:", "http:"] as const,
      invalidMessage: "Invalid URL",
      requiredMessage: "Required"
    }

    expect(validateAbsoluteUrl("javascript:alert(1)", options)).toEqual({
      message: "Invalid URL"
    })
    expect(validateAbsoluteUrl("https://example.com", options)).toBeUndefined()
    expect(
      validateAbsoluteUrlList(
        "https://example.com/callback\nhttp://localhost:3000/callback",
        options
      )
    ).toBeUndefined()
    expect(
      validateAbsoluteUrlList("https://good.test\nnot a url", options)
    ).toEqual({ message: "Invalid URL" })
  })

  it("normalizes string and object validator errors", () => {
    expect(getFormFieldErrorMessage([undefined, { message: "Required" }])).toBe(
      "Required"
    )
    expect(getFormFieldErrorMessage(["Invalid"])).toBe("Invalid")
    expect(getFormFieldErrorMessage([])).toBeUndefined()
  })
})
