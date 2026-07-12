import { useColorScheme } from "nativewind"

/**
 * Concrete token colors for places React Native needs a color VALUE, not a
 * className — `ActivityIndicator` tint, `react-native-svg` icon `color`,
 * `placeholderTextColor`. These mirror the default `theme.css` token values;
 * if a consumer re-themes via CSS variables, update these to match (or read the
 * variables at runtime).
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

const LIGHT: ThemeColors = {
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

const DARK: ThemeColors = {
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

/** Returns the active (light/dark) concrete token colors. */
export function useThemeColors(): ThemeColors {
  const { colorScheme } = useColorScheme()
  return colorScheme === "dark" ? DARK : LIGHT
}

/** Convenience: a single token color for the active scheme. */
export function useThemeColor(name: ThemeColorName): string {
  return useThemeColors()[name]
}
