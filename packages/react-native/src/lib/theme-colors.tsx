import { createContext, type ReactNode, useContext, useMemo } from "react"
import { useColorScheme } from "react-native"

/**
 * Concrete token colors used everywhere the components need styling. React
 * Native has no global CSS, so the library owns its theme as plain JS values
 * (light/dark) and resolves them at runtime — no nativewind / uniwind / babel
 * transform required in the consuming app. Consumers re-theme by wrapping their
 * tree in {@link ThemeProvider} and overriding any token.
 */
export interface ThemeColors {
  accent: string
  accentForeground: string
  surface: string
  surfaceSecondary: string
  foreground: string
  muted: string
  danger: string
  dangerForeground: string
  border: string
}

export const LIGHT_THEME: ThemeColors = {
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

export const DARK_THEME: ThemeColors = {
  accent: "#3b82f6",
  accentForeground: "#ffffff",
  surface: "#171717",
  surfaceSecondary: "#1e1e1e",
  foreground: "#fafafa",
  muted: "#a3a3a3",
  danger: "#ef4444",
  dangerForeground: "#ffffff",
  border: "#2c2c2c"
}

export type ThemeColorName = keyof ThemeColors

type ThemeContextValue = {
  light?: Partial<ThemeColors>
  dark?: Partial<ThemeColors>
  /** Force a scheme; defaults to following the OS via `useColorScheme`. */
  scheme?: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * Optional theme override. Wrap your app to re-theme any token (e.g. the brand
 * `accent`) or force a color scheme. Entirely optional — without it the
 * components follow the OS light/dark defaults.
 */
export function ThemeProvider({
  light,
  dark,
  scheme,
  children
}: ThemeContextValue & { children: ReactNode }) {
  const value = useMemo(() => ({ light, dark, scheme }), [light, dark, scheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/** Returns the active (light/dark) concrete token colors, honoring any override. */
export function useThemeColors(): ThemeColors {
  const systemScheme = useColorScheme()
  const override = useContext(ThemeContext)
  const scheme =
    override?.scheme ?? (systemScheme === "dark" ? "dark" : "light")

  return useMemo(() => {
    const base = scheme === "dark" ? DARK_THEME : LIGHT_THEME
    const ov = scheme === "dark" ? override?.dark : override?.light
    return ov ? { ...base, ...ov } : base
  }, [scheme, override])
}

/** Convenience: a single token color for the active scheme. */
export function useThemeColor(name: ThemeColorName): string {
  return useThemeColors()[name]
}
