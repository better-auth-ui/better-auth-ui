export const PASSWORD_COMPROMISED_ERROR_CODE = "PASSWORD_COMPROMISED"

/**
 * Return whether Better Auth's `haveIBeenPwned` plugin rejected a password
 * because it appears in a known breach corpus.
 *
 * Hosts use this to render the rejection against the password field rather
 * than as a toast, since it is something the user can act on right there.
 */
export function isPasswordCompromisedError(error: unknown) {
  if (typeof error !== "object" || error === null) return false

  if ((error as { code?: unknown }).code === PASSWORD_COMPROMISED_ERROR_CODE) {
    return true
  }

  const errorBody = (error as { error?: unknown }).error
  if (typeof errorBody !== "object" || errorBody === null) return false

  return (
    (errorBody as { code?: unknown }).code === PASSWORD_COMPROMISED_ERROR_CODE
  )
}

/** Coarse buckets a password falls into. `empty` renders no meter at all. */
export type PasswordStrengthLevel =
  | "empty"
  | "weak"
  | "fair"
  | "good"
  | "strong"

export type PasswordStrength = {
  /** 0 for an empty box, then 1 (weak) through 4 (strong). */
  score: 0 | 1 | 2 | 3 | 4
  level: PasswordStrengthLevel
}

export type EvaluatePasswordStrengthOptions = {
  /** The minimum the form itself enforces. Anything shorter can't beat `weak`. */
  minLength?: number
}

const SEQUENCES = ["abcdefghijklmnopqrstuvwxyz", "0123456789", "qwertyuiop"]

/** Whether the password leans on a run like `abcd`, `4321`, or `qwerty`. */
function hasSequentialRun(lowercased: string, runLength = 4) {
  for (const sequence of SEQUENCES) {
    const reversed = [...sequence].reverse().join("")

    for (const haystack of [sequence, reversed]) {
      for (let index = 0; index + runLength <= haystack.length; index++) {
        if (lowercased.includes(haystack.slice(index, index + runLength))) {
          return true
        }
      }
    }
  }

  return false
}

/**
 * Score a password for the strength meter shown while someone types.
 *
 * This is a hint, not a security control: it never leaves the browser and
 * never gates submission. The server's own rules, and the `haveIBeenPwned`
 * plugin if you run it, remain the thing that decides what is acceptable.
 *
 * @param password - The password as typed.
 * @param options - Length policy the surrounding form enforces.
 */
export function evaluatePasswordStrength(
  password: string,
  options: EvaluatePasswordStrengthOptions = {}
): PasswordStrength {
  if (!password) return { score: 0, level: "empty" }

  const minLength = options.minLength ?? 8
  const lowercased = password.toLowerCase()

  let score = 0

  if (password.length >= minLength) score += 1
  if (password.length >= minLength + 4) score += 1
  if (password.length >= 16) score += 1

  const classes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z\d]/.test(password)
  ].filter(Boolean).length

  if (classes >= 3) score += 1
  if (classes === 4) score += 1

  // A single repeated character reads as long but isn't.
  if (new Set(password).size <= 2) score -= 2
  if (hasSequentialRun(lowercased)) score -= 1

  // Nothing under the form's own minimum deserves better than "weak".
  if (password.length < minLength) {
    return { score: 1, level: "weak" }
  }

  const clamped = Math.min(4, Math.max(1, score)) as 1 | 2 | 3 | 4
  const levels = ["weak", "fair", "good", "strong"] as const

  return { score: clamped, level: levels[clamped - 1] }
}
