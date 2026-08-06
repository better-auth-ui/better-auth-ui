export function hasAuthPlugin(plugins: { id: string }[], id: string) {
  return plugins.some((plugin) => plugin.id === id)
}

export const resolveUserLabel = (name?: string | null, email?: string | null) =>
  name?.trim() || email?.trim() || "Signed in user"

export const resolveUserInitials = (
  name?: string | null,
  email?: string | null
) => resolveUserLabel(name, email).slice(0, 2).toUpperCase()

export function timeAgo(date: Date | string) {
  const createdAt = date instanceof Date ? date : new Date(date)
  const seconds = Math.floor((Date.now() - createdAt.getTime()) / 1000)
  const relativeTimeFormat = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto"
  })

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
    ["second", 1]
  ]

  for (const [unit, threshold] of units) {
    if (seconds >= threshold) {
      return relativeTimeFormat.format(-Math.floor(seconds / threshold), unit)
    }
  }

  return relativeTimeFormat.format(0, "second")
}
