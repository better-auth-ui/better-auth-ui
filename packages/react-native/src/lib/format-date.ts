/**
 * Format a date for display. Uses `Intl.DateTimeFormat` when available (Hermes
 * ships a limited ICU) and falls back to `toLocaleString`. Replaces the web
 * components' `new Date(...).toLocaleString(undefined, {...})` calls.
 */
export function formatDateTime(
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short"
  }
): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  try {
    return new Intl.DateTimeFormat(undefined, options).format(date)
  } catch {
    return date.toLocaleString()
  }
}
