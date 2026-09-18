import type { Localization } from "./localization"

type ErrorRecord = Record<string, unknown>

function asRecord(value: unknown): ErrorRecord | undefined {
  return typeof value === "object" && value !== null
    ? (value as ErrorRecord)
    : undefined
}

function errorChain(error: unknown): ErrorRecord[] {
  const chain: ErrorRecord[] = []
  let current = asRecord(error)
  while (current && !chain.includes(current) && chain.length < 8) {
    chain.push(current)
    current = asRecord(current.error) ?? asRecord(current.cause)
  }
  return chain
}

/** Read both Better Fetch error bodies and client-side error codes. */
export function getAuthErrorCode(error: unknown): string | undefined {
  const body = asRecord(asRecord(error)?.error) ?? asRecord(error)
  return typeof body?.code === "string" ? body.code.toUpperCase() : undefined
}

const messageKeys = {
  INVALID_EMAIL_OR_PASSWORD: "invalidCredentials",
  INVALID_USERNAME_OR_PASSWORD: "invalidCredentials",
  INVALID_PHONE_NUMBER_OR_PASSWORD: "invalidCredentials",
  INVALID_PASSWORD: "invalidCredentials",
  INVALID_CODE: "invalidCode",
  INVALID_BACKUP_CODE: "invalidCode",
  TOO_MANY_ATTEMPTS: "rateLimited",
  INVALID_OTP: "invalidCode",
  OTP_EXPIRED: "invalidCode",
  INVALID_TWO_FACTOR_COOKIE: "sessionExpired",
  SESSION_EXPIRED: "sessionExpired",
  SESSION_NOT_FRESH: "sessionExpired",
  UNAUTHORIZED: "sessionExpired",
  FORBIDDEN: "permissionDenied",
  TOO_MANY_REQUESTS: "rateLimited",
  PASSWORD_TOO_SHORT: "passwordTooShort",
  PASSWORD_TOO_LONG: "passwordTooLong",
  USER_ALREADY_EXISTS: "accountExists",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "accountExists",
  POPUP_BLOCKED: "popupBlocked",
  POPUP_TIMEOUT: "popupTimeout",
  ROLE_HAS_MEMBERS: "roleHasMembers"
} satisfies Record<string, keyof Localization["errors"]>

/** Resolve safe localized copy. Only confirmed cancellations in their own flow are silent. */
export function getAuthErrorMessage(
  error: unknown,
  localization: Localization,
  mutationKey: readonly unknown[] = []
): string | null {
  const chain = errorChain(error)
  const body = asRecord(asRecord(error)?.error) ?? asRecord(error)
  const code = getAuthErrorCode(error)
  const isAuth = mutationKey[0] === "auth"
  const isPopup =
    isAuth && mutationKey[1] === "signIn" && mutationKey[2] === "popup"
  const isPasskey =
    isAuth && mutationKey[1] === "signIn" && mutationKey[2] === "passkey"
  const isWallet =
    isAuth &&
    mutationKey[1] === "siwe" &&
    (mutationKey[2] === "signIn" || mutationKey[2] === "link")

  if (isPopup && code === "POPUP_CLOSED") return null
  // NotAllowedError and AUTH_CANCELLED also cover timeouts and genuine failures.
  if (
    isPasskey &&
    chain.some(
      (item) =>
        item.code === "ERROR_CEREMONY_ABORTED" || item.name === "AbortError"
    )
  )
    return null
  if (
    isWallet &&
    chain.some((item) => item.code === 4001 || item.code === "4001")
  )
    return null

  if (code && Object.hasOwn(messageKeys, code)) {
    return localization.errors[messageKeys[code as keyof typeof messageKeys]]
  }
  if (code === "EMAIL_NOT_VERIFIED")
    return localization.auth.callbackEmailNotVerifiedDescription
  if (code === "INVALID_EMAIL") return localization.auth.invalidEmail
  if (code === "INVALID_TOKEN" || code === "TOKEN_EXPIRED")
    return localization.auth.callbackExpiredLinkDescription

  const status = body?.status ?? asRecord(error)?.status
  if (status === 429) return localization.errors.rateLimited
  if (status === 401) return localization.errors.sessionExpired
  if (status === 403) return localization.errors.permissionDenied
  if (isPasskey) return localization.errors.passkeyFailed
  if (isWallet) return localization.errors.walletFailed
  return localization.errors.generic
}
