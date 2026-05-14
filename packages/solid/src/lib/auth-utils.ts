import type { AdditionalField } from "@better-auth-ui/core"

export function resolveRedirectTo(fallback: string): string {
  return (
    (typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("redirectTo")?.trim()) ||
    fallback
  )
}

export function mergeAdditionalFields(
  pluginFields: readonly AdditionalField[] = [],
  userFields: readonly AdditionalField[] = []
): AdditionalField[] {
  const fieldsByName = new Map<string, AdditionalField>()

  for (const field of pluginFields) {
    fieldsByName.set(field.name, field)
  }
  for (const field of userFields) {
    fieldsByName.set(field.name, field)
  }

  return Array.from(fieldsByName.values())
}
