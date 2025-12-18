function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === "object" && !Array.isArray(item)
}

function isPlainObject(item: unknown): item is Record<string, unknown> {
  if (!isObject(item)) return false

  // Handle special object types that should not be merged
  if (item instanceof Date) return false
  if (item instanceof RegExp) return false

  return true
}

export function deepmerge<T>(target: T, source: Partial<T>): T {
  if (isPlainObject(target) && isPlainObject(source)) {
    const result: Record<string, unknown> = { ...target }

    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) continue // skip undefineds

      if (key in target) {
        result[key] = deepmerge(
          (target as Record<string, unknown>)[key],
          value as unknown as Partial<T>
        )
      } else {
        result[key] = value
      }
    }

    return result as T
  }

  return source as T
}
