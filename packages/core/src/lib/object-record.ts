/**
 * Checks that a value is a non-null object, so its properties can be read
 * as `unknown` values.
 *
 * @param value - The value to check.
 * @returns Whether the value is a non-null object.
 */
export function isObjectRecord(
  value: unknown
): value is Record<PropertyKey, unknown> {
  return typeof value === "object" && value !== null
}
