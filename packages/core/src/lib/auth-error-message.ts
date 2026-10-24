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

const clientMessageKeys = {
  POPUP_BLOCKED: "popupBlocked",
  POPUP_TIMEOUT: "popupTimeout",
  ROLE_HAS_MEMBERS: "roleHasMembers"
} satisfies Record<string, keyof Localization["errors"]>

/** Prefer API messages and codes, with localized fallbacks for client failures. */
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

  if (code && Object.hasOwn(clientMessageKeys, code)) {
    return localization.errors[
      clientMessageKeys[code as keyof typeof clientMessageKeys]
    ]
  }

  // Better Auth's passkey client also attaches HTTP-style status fields to
  // browser failures. These are not server messages.
  if (isPasskey && (code === "AUTH_CANCELLED" || code?.startsWith("ERROR_")))
    return localization.errors.passkeyFailed

  const status = body?.status ?? asRecord(error)?.status
  const isResponseError = body !== asRecord(error) || typeof status === "number"
  if (
    !(body instanceof Error) &&
    (isResponseError || (!isPasskey && !isWallet))
  ) {
    if (typeof body?.message === "string" && body.message.trim())
      return body.message
    if (typeof body?.code === "string" && body.code.trim()) return body.code
  }

  if (status === 429) return localization.errors.rateLimited
  if (status === 401) return localization.errors.sessionExpired
  if (status === 403) return localization.errors.permissionDenied
  if (isPasskey) return localization.errors.passkeyFailed
  if (isWallet) return localization.errors.walletFailed
  return localization.errors.generic
}
