export type ThemeMode = "system" | "light" | "dark"

export const themeStorageKey = "start-solid-zaidan-theme"

export const isThemeMode = (value: string | null): value is ThemeMode =>
  value === "system" || value === "light" || value === "dark"

export const resolveThemePreference = (
  theme: ThemeMode,
  prefersDark: boolean
): "light" | "dark" =>
  theme === "system" ? (prefersDark ? "dark" : "light") : theme

export const setDocumentThemeClass = (theme: "light" | "dark") => {
  document.documentElement.classList.remove("light", "dark")
  document.documentElement.classList.add(theme)
}

export const readStoredThemePreference = (): ThemeMode => {
  const storedTheme = localStorage.getItem(themeStorageKey)

  return isThemeMode(storedTheme) ? storedTheme : "system"
}

export const saveThemePreference = (theme: ThemeMode) => {
  localStorage.setItem(themeStorageKey, theme)
}

export const applyThemePreference = (theme: ThemeMode) => {
  const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches

  setDocumentThemeClass(resolveThemePreference(theme, prefersDark))
}

export const syncDocumentThemePreference = () => {
  const mediaQuery = matchMedia("(prefers-color-scheme: dark)")
  const applyStoredPreference = () => {
    applyThemePreference(readStoredThemePreference())
  }
  const handleSystemThemeChange = () => {
    if (readStoredThemePreference() === "system") applyStoredPreference()
  }
  const handleStorage = (event: StorageEvent) => {
    if (event.key === themeStorageKey) applyStoredPreference()
  }

  applyStoredPreference()
  window.addEventListener("storage", handleStorage)
  mediaQuery.addEventListener("change", handleSystemThemeChange)

  return () => {
    window.removeEventListener("storage", handleStorage)
    mediaQuery.removeEventListener("change", handleSystemThemeChange)
  }
}

export const themeScript = `
try {
  const themeStorageKey = "${themeStorageKey}";
  const storedTheme = localStorage.getItem(themeStorageKey);
  const theme = storedTheme === "light" || storedTheme === "dark" || storedTheme === "system" ? storedTheme : "system";
  const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
  const resolvedTheme = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(resolvedTheme);
} catch (_) {}
`
