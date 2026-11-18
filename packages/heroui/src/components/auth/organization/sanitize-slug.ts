/**
 * Sanitize a slug value so it only contains lowercase alphanumeric characters
 * and dashes. Runs of disallowed characters are collapsed to a single dash, but
 * leading/trailing dashes are preserved while the user is still typing.
 */
export function sanitizeSlug(value: string) {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")
}
