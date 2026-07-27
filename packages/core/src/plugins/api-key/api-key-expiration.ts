export const DEFAULT_API_KEY_EXPIRATION_INTERVALS = [30, 90] as const

export const API_KEY_EXPIRATION_SECONDS_PER_DAY = 60 * 60 * 24

export type ApiKeyExpirationOptions = {
  /**
   * Expiration intervals to offer, in days.
   *
   * Keep these values within the `minExpiresIn` and `maxExpiresIn` limits in
   * the matching Better Auth API key server configuration.
   *
   * @default [30, 90]
   */
  intervals?: readonly number[]
  /**
   * The interval selected when the create dialog opens, in days.
   *
   * Set this to `null` to select "Never". If the value is unavailable, the
   * first configured interval is selected instead.
   *
   * @default 30
   */
  defaultInterval?: number | null
  /**
   * Let users create a key without a custom expiration interval.
   *
   * Better Auth will still apply `keyExpiration.defaultExpiresIn` when the
   * server defines one.
   *
   * @default true
   */
  allowNever?: boolean
}

export type ResolvedApiKeyExpirationOptions = {
  intervals: number[]
  defaultInterval: number | null
  allowNever: boolean
}

const isExpirationInterval = (value: number) =>
  Number.isFinite(value) && value > 0

export function resolveApiKeyExpirationOptions(
  options: ApiKeyExpirationOptions = {}
): ResolvedApiKeyExpirationOptions | false {
  const intervals = Array.from(
    new Set(
      (options.intervals ?? DEFAULT_API_KEY_EXPIRATION_INTERVALS).filter(
        isExpirationInterval
      )
    )
  )
  const allowNever = options.allowNever ?? true
  const requestedDefault =
    options.defaultInterval === undefined
      ? DEFAULT_API_KEY_EXPIRATION_INTERVALS[0]
      : options.defaultInterval

  if (intervals.length === 0 && !allowNever) {
    return false
  }

  const defaultInterval =
    requestedDefault === null && allowNever
      ? null
      : requestedDefault !== null && intervals.includes(requestedDefault)
        ? requestedDefault
        : (intervals[0] ?? null)

  return {
    intervals,
    defaultInterval,
    allowNever
  }
}

export const apiKeyExpirationDaysToSeconds = (days: number) =>
  days * API_KEY_EXPIRATION_SECONDS_PER_DAY
