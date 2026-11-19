import type {
  BetterFetchError,
  BetterFetchOption,
  BetterFetchPlugin
} from "better-auth/client"
import { isObjectRecord } from "./object-record"

const DEFAULT_AUTH_QUERY_RETRY_COUNT = 3
const MAX_AUTH_QUERY_RETRY_DELAY = 30_000
const RETRYABLE_AUTH_QUERY_STATUS_CODES = new Set([
  408, 429, 500, 502, 503, 504
])

export type AuthQueryError = BetterFetchError & {
  retryAfterMs?: number
}

export const REAUTHENTICATION_REQUIRED_ERROR_CODES = new Set([
  "SESSION_NOT_FRESH",
  "SESSION_EXPIRED"
])

/** Return whether Better Auth requires the user to authenticate again. */
export function isReauthenticationRequiredError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false

  const code = (error as { code?: unknown }).code
  if (
    typeof code === "string" &&
    REAUTHENTICATION_REQUIRED_ERROR_CODES.has(code)
  ) {
    return true
  }

  const errorBody = (error as { error?: unknown }).error
  if (typeof errorBody !== "object" || errorBody === null) return false

  const nestedCode = (errorBody as { code?: unknown }).code

  return (
    typeof nestedCode === "string" &&
    REAUTHENTICATION_REQUIRED_ERROR_CODES.has(nestedCode)
  )
}

class AuthQueryResponseError extends Error implements AuthQueryError {
  constructor(
    readonly status: number,
    readonly statusText: string,
    readonly error: unknown,
    readonly retryAfterMs: number
  ) {
    super(statusText || String(status), { cause: error })
  }
}

function getNumericProperty(
  value: unknown,
  property: "retryAfterMs" | "status"
) {
  if (!isObjectRecord(value)) {
    return undefined
  }

  const propertyValue = value[property]

  return typeof propertyValue === "number" ? propertyValue : undefined
}

function parseRetryAfter(value: string) {
  const seconds = Number(value)

  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000
  }

  const date = Date.parse(value)

  if (Number.isNaN(date)) {
    return undefined
  }

  return Math.max(0, date - Date.now())
}

function getRetryAfter(response: Response) {
  const retryAfter = response.headers.get("Retry-After")
  const parsedRetryAfter =
    retryAfter === null ? undefined : parseRetryAfter(retryAfter)

  if (parsedRetryAfter !== undefined) {
    return parsedRetryAfter
  }

  const legacyRetryAfter = response.headers.get("X-Retry-After")

  return legacyRetryAfter === null
    ? undefined
    : parseRetryAfter(legacyRetryAfter)
}

const authQueryRetryPlugin = {
  id: "better-auth-ui-query-retry",
  name: "Better Auth UI query retry",
  hooks: {
    onError: (context) => {
      const retryAfterMs = getRetryAfter(context.response)

      if (retryAfterMs === undefined) return Promise.resolve()

      return Promise.reject(
        new AuthQueryResponseError(
          context.response.status,
          context.response.statusText,
          context.error,
          retryAfterMs
        )
      )
    }
  }
} satisfies BetterFetchPlugin

export function createAuthQueryFetchOptions(
  fetchOptions: BetterFetchOption | undefined,
  signal: AbortSignal
): BetterFetchOption & { throw: true } {
  return {
    ...fetchOptions,
    signal,
    throw: true,
    plugins: [...(fetchOptions?.plugins ?? []), authQueryRetryPlugin]
  }
}

export function isRetryableAuthQueryError(error: unknown): boolean {
  const status = getNumericProperty(error, "status")

  return status === undefined || RETRYABLE_AUTH_QUERY_STATUS_CODES.has(status)
}

export function shouldRetryAuthQuery(
  failureCount: number,
  error: unknown
): boolean {
  return (
    failureCount < DEFAULT_AUTH_QUERY_RETRY_COUNT &&
    isRetryableAuthQueryError(error)
  )
}

export function authQueryRetryDelay(
  failureCount: number,
  error: unknown
): number {
  const retryAfterMs = getNumericProperty(error, "retryAfterMs")

  if (
    retryAfterMs !== undefined &&
    Number.isFinite(retryAfterMs) &&
    retryAfterMs >= 0
  ) {
    return retryAfterMs
  }

  return Math.min(1000 * 2 ** failureCount, MAX_AUTH_QUERY_RETRY_DELAY)
}

export function createAuthQueryRetryOptions(isServer: () => boolean) {
  return {
    retry: (failureCount: number, error: unknown): boolean =>
      !isServer() && shouldRetryAuthQuery(failureCount, error),
    retryDelay: authQueryRetryDelay
  } as const
}
