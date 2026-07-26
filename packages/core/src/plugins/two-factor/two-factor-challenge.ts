/**
 * Second-factor methods a user can complete the challenge with.
 *
 * `totp` and `otp` come from the server's `twoFactorMethods` list. Backup
 * codes are always available when the server has them enabled, so they are
 * never part of that list.
 */
export type TwoFactorMethod = "totp" | "otp"

const TWO_FACTOR_METHODS: TwoFactorMethod[] = ["totp", "otp"]

/**
 * `sessionStorage` key holding the methods reported by the sign-in response.
 *
 * Only the non-sensitive method names are stored — never a code, token, or
 * the two-factor cookie, which stays HTTP-only.
 */
export const TWO_FACTOR_METHODS_STORAGE_KEY =
  "better-auth-ui.two-factor-methods"

/**
 * Sign-in response shape Better Auth returns instead of a session when a
 * second factor is required.
 */
export type TwoFactorRedirect = {
  twoFactorRedirect: true
  twoFactorMethods?: string[]
}

/**
 * Detect the `twoFactorRedirect` payload in a sign-in response.
 *
 * Better Auth deliberately withholds the session until the second factor
 * succeeds, so every sign-in strategy has to check for this before treating a
 * successful response as authenticated.
 *
 * @param data - Resolved data of a sign-in mutation.
 */
export function isTwoFactorRedirect(data: unknown): data is TwoFactorRedirect {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { twoFactorRedirect?: unknown }).twoFactorRedirect === true
  )
}

/**
 * Narrow arbitrary method names to the ones the challenge view can render.
 *
 * @param methods - Raw `twoFactorMethods` from the sign-in response.
 */
export function parseTwoFactorMethods(methods?: unknown): TwoFactorMethod[] {
  if (!Array.isArray(methods)) return []

  return TWO_FACTOR_METHODS.filter((method) => methods.includes(method))
}

/**
 * Persist the enabled methods so the challenge view knows which options to
 * offer after the navigation.
 *
 * @param methods - Raw `twoFactorMethods` from the sign-in response.
 */
export function storeTwoFactorMethods(methods?: unknown) {
  if (typeof sessionStorage === "undefined") return

  sessionStorage.setItem(
    TWO_FACTOR_METHODS_STORAGE_KEY,
    JSON.stringify(parseTwoFactorMethods(methods))
  )
}

/**
 * Read the methods stored by the sign-in continuation.
 *
 * Returns every method when nothing was stored (e.g. the challenge view was
 * opened directly) so the user still gets a way in.
 */
export function readTwoFactorMethods(): TwoFactorMethod[] {
  if (typeof sessionStorage === "undefined") return TWO_FACTOR_METHODS

  const stored = sessionStorage.getItem(TWO_FACTOR_METHODS_STORAGE_KEY)
  if (!stored) return TWO_FACTOR_METHODS

  try {
    const methods = parseTwoFactorMethods(JSON.parse(stored))
    return methods.length ? methods : TWO_FACTOR_METHODS
  } catch {
    return TWO_FACTOR_METHODS
  }
}

/** Clear the stored methods once the challenge is finished or abandoned. */
export function clearTwoFactorMethods() {
  if (typeof sessionStorage === "undefined") return

  sessionStorage.removeItem(TWO_FACTOR_METHODS_STORAGE_KEY)
}
