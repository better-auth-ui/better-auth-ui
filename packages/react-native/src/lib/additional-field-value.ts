import type { AdditionalFieldValue } from "@better-auth-ui/core"

/**
 * Reads an additional field from a Better Auth model, such as a user, member,
 * or invitation, and keeps it only when it has a supported field value type.
 *
 * @param model - The Better Auth model.
 * @param name - The additional field name.
 * @returns The field value, or `null` when it is missing or unsupported.
 */
export function readAdditionalFieldValue(
  model: object,
  name: string
): AdditionalFieldValue | null {
  const value: unknown = Reflect.get(model, name)

  return typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value instanceof Date
    ? value
    : null
}
