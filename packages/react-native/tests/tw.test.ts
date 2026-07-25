import { describe, expect, it } from "vitest"
import type { ThemeColors } from "../src/lib/theme-colors"
import { tw } from "../src/lib/tw"

// Local fixtures rather than the exported themes: `theme-colors` pulls in the
// React Native runtime (`useColorScheme`), while `tw` itself is pure and needs
// only a palette, so this keeps the resolver under a plain unit test.
const LIGHT_THEME: ThemeColors = {
  accent: "#2563eb",
  accentForeground: "#ffffff",
  surface: "#ffffff",
  surfaceSecondary: "#f5f5f5",
  foreground: "#171717",
  muted: "#737373",
  danger: "#dc2626",
  dangerForeground: "#ffffff",
  border: "#e5e5e5"
}

const DARK_THEME: ThemeColors = { ...LIGHT_THEME, surface: "#0a0a0a" }

/**
 * `tw` is the styling foundation of this package: it resolves the class strings
 * the components author with into plain React Native styles, so consuming apps
 * need no nativewind / uniwind / babel transform.
 */
describe("tw", () => {
  it("returns an empty style for no class", () => {
    expect(tw(undefined, LIGHT_THEME)).toEqual({})
    expect(tw("", LIGHT_THEME)).toEqual({})
  })

  it("resolves fixed layout utilities", () => {
    expect(tw("flex-row items-center justify-between", LIGHT_THEME)).toEqual({
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    })
  })

  it("applies the 4px spacing scale", () => {
    expect(tw("gap-2 px-4 py-1.5", LIGHT_THEME)).toMatchObject({
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 6
    })
  })

  it("supports negative, fractional, full and px spacing", () => {
    expect(tw("-mx-4", LIGHT_THEME)).toEqual({ marginHorizontal: -16 })
    expect(tw("w-1/2", LIGHT_THEME)).toEqual({ width: "50%" })
    expect(tw("w-full", LIGHT_THEME)).toEqual({ width: "100%" })
    expect(tw("h-px", LIGHT_THEME)).toEqual({ height: 1 })
  })

  it("expands size-* to both dimensions", () => {
    expect(tw("size-5", LIGHT_THEME)).toEqual({ width: 20, height: 20 })
  })

  it("resolves colors against the active theme", () => {
    expect(tw("bg-surface", LIGHT_THEME)).toEqual({
      backgroundColor: LIGHT_THEME.surface
    })
    expect(tw("bg-surface", DARK_THEME)).toEqual({
      backgroundColor: DARK_THEME.surface
    })
    // Same class, different theme -> different value (cache stays scheme-aware).
    expect(tw("bg-surface", LIGHT_THEME)).not.toEqual(
      tw("bg-surface", DARK_THEME)
    )
  })

  it("distinguishes border width from border color", () => {
    expect(tw("border-2", LIGHT_THEME)).toEqual({ borderWidth: 2 })
    expect(tw("border-border", LIGHT_THEME)).toEqual({
      borderColor: LIGHT_THEME.border
    })
  })

  it("distinguishes text size from text color", () => {
    expect(tw("text-sm", LIGHT_THEME)).toMatchObject({ fontSize: 14 })
    expect(tw("text-foreground", LIGHT_THEME)).toEqual({
      color: LIGHT_THEME.foreground
    })
  })

  it("resolves radius and opacity", () => {
    expect(tw("rounded", LIGHT_THEME)).toEqual({ borderRadius: 4 })
    expect(tw("rounded-full", LIGHT_THEME)).toEqual({ borderRadius: 9999 })
    expect(tw("opacity-50", LIGHT_THEME)).toEqual({ opacity: 0.5 })
  })

  it("ignores unknown tokens instead of throwing", () => {
    expect(tw("not-a-real-class flex-row", LIGHT_THEME)).toEqual({
      flexDirection: "row"
    })
  })

  it("lets later classes win, so callers can override", () => {
    expect(tw("p-2 p-4", LIGHT_THEME)).toEqual({ padding: 16 })
  })

  it("tolerates extra whitespace from conditional class strings", () => {
    expect(tw("  flex-row   items-center  ", LIGHT_THEME)).toEqual({
      flexDirection: "row",
      alignItems: "center"
    })
  })

  it("returns a stable reference for repeat calls (cache)", () => {
    const a = tw("flex-1 gap-2", LIGHT_THEME)
    const b = tw("flex-1 gap-2", LIGHT_THEME)
    expect(a).toBe(b)
  })
})
