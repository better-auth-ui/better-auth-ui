import type { TextStyle, ViewStyle } from "react-native"
import type { ThemeColors } from "./theme-colors"

/**
 * A small, self-contained `className -> React Native style` resolver scoped to
 * the utility vocabulary this library uses. It lets the components author with
 * compact class strings while shipping plain RN styles — so the consuming app
 * needs NO nativewind / uniwind / babel transform / metro config. Colors resolve
 * against the active {@link ThemeColors}. Unknown tokens are ignored (pass a
 * `style` prop for anything outside this vocabulary).
 */

type Style = ViewStyle & TextStyle

const COLOR: Record<string, keyof ThemeColors> = {
  accent: "accent",
  "accent-foreground": "accentForeground",
  surface: "surface",
  "surface-secondary": "surfaceSecondary",
  foreground: "foreground",
  muted: "muted",
  danger: "danger",
  "danger-foreground": "dangerForeground",
  border: "border"
}

const FONT_SIZE: Record<string, [number, number]> = {
  xs: [12, 16],
  sm: [14, 20],
  base: [16, 24],
  lg: [18, 28],
  xl: [20, 28],
  "2xl": [24, 32],
  "3xl": [30, 36]
}
const FONT_WEIGHT: Record<string, TextStyle["fontWeight"]> = {
  thin: "100",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800"
}
const LEADING: Record<string, number> = {
  none: 16,
  tight: 18,
  snug: 20,
  normal: 24,
  relaxed: 28,
  loose: 32
}
const TRACKING: Record<string, number> = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.6
}
const RADIUS: Record<string, number> = {
  none: 0,
  sm: 4,
  DEFAULT: 4,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
  "3xl": 24,
  full: 9999
}

/** tailwind spacing scale: `n` -> n * 4 px (supports `full`, `px`, fractions). */
function space(n: string): number | `${number}%` | undefined {
  if (n === "full") return "100%"
  if (n === "px") return 1
  if (n === "auto") return undefined
  if (n.endsWith("/2")) return "50%"
  if (n.endsWith("/3")) return "33.333333%"
  const v = Number(n)
  return Number.isNaN(v) ? undefined : v * 4
}

const FIXED: Record<string, Style> = {
  flex: { display: "flex" },
  "flex-row": { flexDirection: "row" },
  "flex-col": { flexDirection: "column" },
  "flex-wrap": { flexWrap: "wrap" },
  "flex-1": { flex: 1 },
  "flex-none": { flexGrow: 0, flexShrink: 0 },
  "items-center": { alignItems: "center" },
  "items-start": { alignItems: "flex-start" },
  "items-end": { alignItems: "flex-end" },
  "items-stretch": { alignItems: "stretch" },
  "items-baseline": { alignItems: "baseline" },
  "justify-center": { justifyContent: "center" },
  "justify-between": { justifyContent: "space-between" },
  "justify-around": { justifyContent: "space-around" },
  "justify-start": { justifyContent: "flex-start" },
  "justify-end": { justifyContent: "flex-end" },
  "self-start": { alignSelf: "flex-start" },
  "self-center": { alignSelf: "center" },
  "self-end": { alignSelf: "flex-end" },
  "self-stretch": { alignSelf: "stretch" },
  "shrink-0": { flexShrink: 0 },
  shrink: { flexShrink: 1 },
  "grow-0": { flexGrow: 0 },
  grow: { flexGrow: 1 },
  "w-full": { width: "100%" },
  "w-fit": { alignSelf: "flex-start" },
  "w-auto": {},
  "h-full": { height: "100%" },
  "h-auto": {},
  absolute: { position: "absolute" },
  relative: { position: "relative" },
  "overflow-hidden": { overflow: "hidden" },
  "overflow-visible": { overflow: "visible" },
  border: { borderWidth: 1 },
  "border-0": { borderWidth: 0 },
  "border-t": { borderTopWidth: 1 },
  "border-b": { borderBottomWidth: 1 },
  "border-l": { borderLeftWidth: 1 },
  "border-r": { borderRightWidth: 1 },
  "border-dashed": { borderStyle: "dashed" },
  "border-solid": { borderStyle: "solid" },
  "bg-transparent": { backgroundColor: "transparent" },
  "text-center": { textAlign: "center" },
  "text-left": { textAlign: "left" },
  "text-right": { textAlign: "right" },
  uppercase: { textTransform: "uppercase" },
  lowercase: { textTransform: "lowercase" },
  capitalize: { textTransform: "capitalize" },
  italic: { fontStyle: "italic" },
  "ml-auto": { marginLeft: "auto" },
  "mr-auto": { marginRight: "auto" },
  "mx-auto": { marginLeft: "auto", marginRight: "auto" }
}

const SPACE_PROP: Record<string, keyof ViewStyle> = {
  gap: "gap",
  "gap-x": "columnGap",
  "gap-y": "rowGap",
  p: "padding",
  px: "paddingHorizontal",
  py: "paddingVertical",
  pt: "paddingTop",
  pb: "paddingBottom",
  pl: "paddingLeft",
  pr: "paddingRight",
  m: "margin",
  mx: "marginHorizontal",
  my: "marginVertical",
  mt: "marginTop",
  mb: "marginBottom",
  ml: "marginLeft",
  mr: "marginRight",
  w: "width",
  h: "height",
  "min-w": "minWidth",
  "min-h": "minHeight",
  "max-w": "maxWidth",
  "max-h": "maxHeight",
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
  inset: "inset" as keyof ViewStyle
}

const SPACE_RE = new RegExp(
  `^(${Object.keys(SPACE_PROP)
    .sort((a, b) => b.length - a.length)
    .join("|")})-(.+)$`
)

function token(raw: string, colors: ThemeColors): Style | null {
  // negative utilities: `-mx-4`
  const neg = raw.startsWith("-")
  const tok = neg ? raw.slice(1) : raw

  const fixed = FIXED[tok]
  if (fixed) return fixed

  const sp = tok.match(SPACE_RE)
  if (sp) {
    const val = space(sp[2])
    if (val === undefined) return null
    const n = typeof val === "number" && neg ? -val : val
    return { [SPACE_PROP[sp[1]]]: n } as Style
  }
  const size = tok.match(/^size-(.+)$/)
  if (size) {
    const val = space(size[1])
    return val === undefined ? null : ({ width: val, height: val } as Style)
  }
  const rounded = tok.match(/^rounded(?:-(.+))?$/)
  if (rounded) return { borderRadius: RADIUS[rounded[1] ?? "DEFAULT"] ?? 4 }

  const opacity = tok.match(/^opacity-(\d+)$/)
  if (opacity) return { opacity: Number(opacity[1]) / 100 }

  const text = tok.match(/^text-(.+)$/)
  if (text) {
    const fs = FONT_SIZE[text[1]]
    if (fs) return { fontSize: fs[0], lineHeight: fs[1] }
    if (COLOR[text[1]]) return { color: colors[COLOR[text[1]]] }
    return null
  }
  const font = tok.match(/^font-(.+)$/)
  if (font)
    return FONT_WEIGHT[font[1]] ? { fontWeight: FONT_WEIGHT[font[1]] } : null

  const leading = tok.match(/^leading-(.+)$/)
  if (leading)
    return LEADING[leading[1]] ? { lineHeight: LEADING[leading[1]] } : null

  const tracking = tok.match(/^tracking-(.+)$/)
  if (tracking)
    return tracking[1] in TRACKING
      ? { letterSpacing: TRACKING[tracking[1]] }
      : null

  const bg = tok.match(/^bg-(.+)$/)
  if (bg) return COLOR[bg[1]] ? { backgroundColor: colors[COLOR[bg[1]]] } : null

  const bWidth = tok.match(/^border-(\d+)$/)
  if (bWidth) return { borderWidth: Number(bWidth[1]) }

  const bColor = tok.match(/^border-(.+)$/)
  if (bColor)
    return COLOR[bColor[1]] ? { borderColor: colors[COLOR[bColor[1]]] } : null

  const z = tok.match(/^z-(\d+)$/)
  if (z) return { zIndex: Number(z[1]) }

  return null
}

// Module-level cache: each unique (scheme, className) is parsed once, then O(1).
const cache = new Map<string, Style>()

/** Resolve a class string to a React Native style object. */
export function tw(className: string | undefined, colors: ThemeColors): Style {
  if (!className) return {}
  const key = `${colors.surface}|${className}`
  const hit = cache.get(key)
  if (hit) return hit
  const out: Style = {}
  for (const t of className.trim().split(/\s+/)) {
    if (!t) continue
    const frag = token(t, colors)
    if (frag) Object.assign(out, frag)
  }
  cache.set(key, out)
  return out
}
