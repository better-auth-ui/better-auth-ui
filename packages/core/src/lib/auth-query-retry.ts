import type {
  BetterFetchError,
  BetterFetchOption,
  BetterFetchPlugin
} from "better-auth/client"

const DEFAULT_AUTH_QUERY_RETRY_COUNT = 3
const MAX_AUTH_QUERY_RETRY_DELAY = 30_000
const RETRYABLE_AUTH_QUERY_STATUS_CODES = new Set([
  408, 429, 500, 502, 503, 504
])

export type AuthQueryError = BetterFetchError & {
  retryAfterMs?: number
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
  if (typeof value !== "object" || value === null) {
    return undefined
  }

  const propertyValue = (value as Record<PropertyKey, unknown>)[property]

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
    onError: async (context) => {
      const retryAfterMs = getRetryAfter(context.response)

      if (retryAfterMs !== undefined) {
        throw new AuthQueryResponseError(
          context.response.status,
          context.response.statusText,
          context.error,
          retryAfterMs
        )
      }
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

export function isRetryableAuthQueryError(error: unknown) {
  const status = getNumericProperty(error, "status")

  return status === undefined || RETRYABLE_AUTH_QUERY_STATUS_CODES.has(status)
}

export function shouldRetryAuthQuery(failureCount: number, error: unknown) {
  return (
    failureCount < DEFAULT_AUTH_QUERY_RETRY_COUNT &&
    isRetryableAuthQueryError(error)
  )
}

export function authQueryRetryDelay(failureCount: number, error: unknown) {
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
    retry: (failureCount: number, error: unknown) =>
      !isServer() && shouldRetryAuthQuery(failureCount, error),
    retryDelay: authQueryRetryDelay
  } as const
}
