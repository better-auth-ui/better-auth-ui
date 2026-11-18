/**
 * Reads the `message` of a caught error, including the plain error objects
 * that some Better Auth calls reject with.
 *
 * @param error - The caught value.
 * @returns The error message, or `undefined` when the value has none.
 */
export function getErrorMessage(error: unknown): string | undefined {
  return typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
    ? error.message
    : undefined
}

/**
 * Reads the message of a Better Auth error body (`error.error.message`).
 *
 * @param error - The caught value.
 * @returns The response message, or `undefined` when the error has none.
 */
export function getErrorBodyMessage(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "error" in error
    ? getErrorMessage(error.error)
    : undefined
}
