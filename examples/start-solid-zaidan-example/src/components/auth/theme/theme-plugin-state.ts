import {
  themeLocalization,
  themePlugin
} from "@better-auth-ui/core/plugins/theme"
import {
  applyThemePreference,
  isThemeMode,
  readStoredThemePreference,
  saveThemePreference,
  type ThemeMode
} from "@/lib/theme"

type ThemePluginState = {
  id: string
  localization?: Partial<typeof themeLocalization>
  setTheme?: (theme: string) => void
  theme?: string
  themes?: string[]
}

export type ThemeOption = {
  value: ThemeMode
}

export const themeOptions = [
  { value: "system" },
  { value: "light" },
  { value: "dark" }
] as const satisfies readonly ThemeOption[]

const readInitialThemePreference = () => {
  if (typeof window === "undefined") return "system"

  return readStoredThemePreference()
}

export const resolveThemePluginState = (plugins: ThemePluginState[]) => {
  const plugin = plugins.find((candidate) => candidate.id === themePlugin.id)
  const allowedThemes = new Set(
    plugin?.themes ?? themeOptions.map((option) => option.value)
  )
  const themes = themeOptions.filter((option) =>
    allowedThemes.has(option.value)
  )
  const configuredTheme = plugin?.theme ?? null
  const initialTheme = isThemeMode(configuredTheme)
    ? configuredTheme
    : readInitialThemePreference()
  const setTheme = plugin?.setTheme ?? applyThemePreference

  return {
    localization: {
      ...themeLocalization,
      ...plugin?.localization
    },
    setTheme: (theme: ThemeMode) => {
      saveThemePreference(theme)
      setTheme(theme)
    },
    theme: themes.some((option) => option.value === initialTheme)
      ? initialTheme
      : (themes[0]?.value ?? "system"),
    themes
  }
}
