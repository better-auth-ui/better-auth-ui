import { describe, expect, it } from "vitest"
import { deepmerge } from "../src/lib/utils"

describe("deepmerge", () => {
  describe("basic merging", () => {
    it("should merge two simple objects", () => {
      const target = { a: 1, b: 2 }
      const source = { c: 3 }
      const result = deepmerge(target, source)

      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })

    it("should override target properties with source properties", () => {
      const target = { a: 1, b: 2 }
      const source = { b: 3 }
      const result = deepmerge(target, source)

      expect(result).toEqual({ a: 1, b: 3 })
    })

    it("should handle empty target object", () => {
      const target = {}
      const source = { a: 1, b: 2 }
      const result = deepmerge(target, source)

      expect(result).toEqual({ a: 1, b: 2 })
    })

    it("should handle empty source object", () => {
      const target = { a: 1, b: 2 }
      const source = {}
      const result = deepmerge(target, source)

      expect(result).toEqual({ a: 1, b: 2 })
    })

    it("should handle both empty objects", () => {
      const target = {}
      const source = {}
      const result = deepmerge(target, source)

      expect(result).toEqual({})
    })
  })

  describe("nested object merging", () => {
    it("should deep merge nested objects", () => {
      const target = { a: { b: 1, c: 2 } }
      const source = { a: { c: 3, d: 4 } }
      const result = deepmerge(target, source)

      expect(result).toEqual({ a: { b: 1, c: 3, d: 4 } })
    })

    it("should merge deeply nested objects", () => {
      const target = { a: { b: { c: 1, d: 2 } } }
      const source = { a: { b: { d: 3, e: 4 } } }
      const result = deepmerge(target, source)

      expect(result).toEqual({ a: { b: { c: 1, d: 3, e: 4 } } })
    })

    it("should handle multiple levels of nesting", () => {
      const target = {
        level1: {
          level2: {
            level3: {
              value: "old"
            }
          }
        }
      }
      const source = {
        level1: {
          level2: {
            level3: {
              value: "new",
              extra: "added"
            }
          }
        }
      }
      const result = deepmerge(target, source)

      expect(result).toEqual({
        level1: {
          level2: {
            level3: {
              value: "new",
              extra: "added"
            }
          }
        }
      })
    })

    it("should merge sibling nested objects", () => {
      const target = { a: { b: 1 }, c: { d: 2 } }
      const source = { a: { e: 3 }, c: { f: 4 } }
      const result = deepmerge(target, source)

      expect(result).toEqual({ a: { b: 1, e: 3 }, c: { d: 2, f: 4 } })
    })
  })

  describe("undefined handling", () => {
    it("should skip undefined values in source", () => {
      const target = { a: 1, b: 2, c: 3 }
      const source = { b: undefined, d: 4 }
      const result = deepmerge(target, source)

      expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 })
    })

    it("should skip deeply nested undefined values", () => {
      const target = { a: { b: 1, c: 2 } }
      const source = { a: { b: undefined, d: 3 } }
      const result = deepmerge(target, source)

      expect(result).toEqual({ a: { b: 1, c: 2, d: 3 } })
    })

    it("should handle all undefined values in source", () => {
      const target = { a: 1, b: 2 }
      const source = { a: undefined, b: undefined }
      const result = deepmerge(target, source)

      expect(result).toEqual({ a: 1, b: 2 })
    })
  })

  describe("primitive value handling", () => {
    it("should override with string values", () => {
      const target = { a: 1 }
      const source = { a: "string" }
      const result = deepmerge(target, source)

      expect(result).toEqual({ a: "string" })
    })

    it("should override with boolean values", () => {
      const target = { a: 1 }
      const source = { a: false }
      const result = deepmerge(target, source)

      expect(result).toEqual({ a: false })
    })

    it("should override with null values", () => {
      const target = { a: 1 }
      const source = { a: null }
      const result = deepmerge(target, source)

      expect(result).toEqual({ a: null })
    })

    it("should handle number zero", () => {
      const target = { a: 1 }
      const source = { a: 0 }
      const result = deepmerge(target, source)

      expect(result).toEqual({ a: 0 })
    })

    it("should handle empty string", () => {
      const target = { a: "old" }
      const source = { a: "" }
      const result = deepmerge(target, source)

      expect(result).toEqual({ a: "" })
    })
  })

  describe("array handling", () => {
    it("should replace arrays instead of merging", () => {
      const target = { arr: [1, 2, 3] }
      const source = { arr: [4, 5] }
      const result = deepmerge(target, source)

      expect(result).toEqual({ arr: [4, 5] })
    })

    it("should handle empty arrays", () => {
      const target = { arr: [1, 2, 3] }
      const source = { arr: [] }
      const result = deepmerge(target, source)

      expect(result).toEqual({ arr: [] })
    })

    it("should handle arrays in nested objects", () => {
      const target = { a: { arr: [1, 2] } }
      const source = { a: { arr: [3, 4] } }
      const result = deepmerge(target, source)

      expect(result).toEqual({ a: { arr: [3, 4] } })
    })
  })

  describe("complex scenarios", () => {
    it("should merge configuration objects", () => {
      const target = {
        basePaths: { auth: "/auth", account: "/account" },
        redirectTo: "/",
        emailAndPassword: { enabled: true, minLength: 8 }
      }
      const source = {
        redirectTo: "/dashboard",
        emailAndPassword: { minLength: 10, maxLength: 128 }
      }
      const result = deepmerge(target, source)

      expect(result).toEqual({
        basePaths: { auth: "/auth", account: "/account" },
        redirectTo: "/dashboard",
        emailAndPassword: { enabled: true, minLength: 10, maxLength: 128 }
      })
    })

    it("should not mutate original objects", () => {
      const target = { a: { b: 1 } }
      const source = { a: { c: 2 } }
      const targetCopy = JSON.parse(JSON.stringify(target))
      const sourceCopy = JSON.parse(JSON.stringify(source))

      deepmerge(target, source)

      expect(target).toEqual(targetCopy)
      expect(source).toEqual(sourceCopy)
    })

    it("should handle mixed types in nested objects", () => {
      const target = {
        config: {
          enabled: true,
          options: { a: 1, b: 2 },
          list: [1, 2, 3]
        }
      }
      const source = {
        config: {
          enabled: false,
          options: { b: 3, c: 4 },
          list: [4, 5]
        }
      }
      const result = deepmerge(target, source)

      expect(result).toEqual({
        config: {
          enabled: false,
          options: { a: 1, b: 3, c: 4 },
          list: [4, 5]
        }
      })
    })
  })

  describe("edge cases", () => {
    it("should handle functions as values", () => {
      const fn1 = () => "old"
      const fn2 = () => "new"
      const target = { func: fn1 }
      const source = { func: fn2 }
      const result = deepmerge(target, source)

      expect(result.func).toBe(fn2)
      expect(result.func()).toBe("new")
    })

    it("should handle Date objects", () => {
      const date1 = new Date("2023-01-01")
      const date2 = new Date("2024-01-01")
      const target = { date: date1 }
      const source = { date: date2 }
      const result = deepmerge(target, source)

      expect(result.date).toBe(date2)
    })

    it("should handle RegExp objects", () => {
      const regex1 = /test1/
      const regex2 = /test2/
      const target = { regex: regex1 }
      const source = { regex: regex2 }
      const result = deepmerge(target, source)

      expect(result.regex).toBe(regex2)
    })

    it("should handle objects with null prototype", () => {
      const target = Object.create(null)
      target.a = 1
      const source = { b: 2 }
      const result = deepmerge(target, source)

      expect(result).toHaveProperty("a", 1)
      expect(result).toHaveProperty("b", 2)
    })
  })

  describe("type preservation", () => {
    it("should preserve string types", () => {
      const result = deepmerge({ a: "test" }, { b: "value" })
      expect(typeof result.a).toBe("string")
      expect(typeof result.b).toBe("string")
    })

    it("should preserve number types", () => {
      const result = deepmerge({ a: 1 }, { b: 2 })
      expect(typeof result.a).toBe("number")
      expect(typeof result.b).toBe("number")
    })

    it("should preserve boolean types", () => {
      const result = deepmerge({ a: true }, { b: false })
      expect(typeof result.a).toBe("boolean")
      expect(typeof result.b).toBe("boolean")
    })
  })
})
