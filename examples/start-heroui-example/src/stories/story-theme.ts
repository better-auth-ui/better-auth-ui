export type StoryTheme = "system" | "light" | "dark"

function resolveStoryTheme(theme: StoryTheme): "light" | "dark" {
  if (theme !== "system") return theme

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export function applyStoryTheme(theme: StoryTheme) {
  const resolvedTheme = resolveStoryTheme(theme)
  const root = document.documentElement

  root.classList.toggle("light", resolvedTheme === "light")
  root.classList.toggle("dark", resolvedTheme === "dark")
  root.setAttribute("data-theme", resolvedTheme)
  root.style.colorScheme = resolvedTheme
}
