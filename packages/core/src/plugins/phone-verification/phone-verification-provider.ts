/**
 * Verification lifecycle status.
 *
 * `pending`, `verified`, `expired` and `failed` are reported by the
 * verification provider. `cancelled` and `timeout` are client-side outcomes:
 * the user dismissed the flow, or `timeout` elapsed before a terminal status
 * arrived.
 */
export type PhoneVerificationStatus =
  | "pending"
  | "verified"
  | "expired"
  | "cancelled"
  | "timeout"
  | "failed"

/** Statuses after which polling stops and the flow can only be retried. */
export const phoneVerificationTerminalStatuses: PhoneVerificationStatus[] = [
  "verified",
  "expired",
  "cancelled",
  "timeout",
  "failed"
]

/**
 * Verification flow variant.
 *
 * - `phone` — verify ownership and receive the phone number.
 * - `login` — passwordless login; returns a stable provider `userId`.
 * - `2fa` — second factor; checks the responder matches a known `userId`.
 */
export type PhoneVerificationFlow = "phone" | "login" | "2fa"

/** Machine-readable error categories surfaced to UI for recovery actions. */
export type PhoneVerificationErrorCode =
  | "invalidRequest"
  | "unauthorized"
  | "insufficientCredits"
  | "sessionNotFound"
  | "rateLimited"
  | "serverError"
  | "networkError"
  | "invalidResponse"

/**
 * Error thrown by phone verification providers and clients.
 *
 * Carries a stable {@link PhoneVerificationErrorCode} so UI components can
 * branch on the failure category without parsing messages.
 */
export class PhoneVerificationError extends Error {
  code: PhoneVerificationErrorCode
  /** HTTP status of the failed request, when applicable. */
  status?: number

  constructor(
    code: PhoneVerificationErrorCode,
    message: string,
    options?: { status?: number; cause?: unknown }
  ) {
    super(message, { cause: options?.cause })
    this.name = "PhoneVerificationError"
    this.code = code
    this.status = options?.status
  }
}

/** Map an HTTP status to a {@link PhoneVerificationErrorCode}. */
export function phoneVerificationErrorCodeFromStatus(
  status: number
): PhoneVerificationErrorCode {
  switch (status) {
    case 400:
      return "invalidRequest"
    case 401:
      return "unauthorized"
    case 402:
      return "insufficientCredits"
    case 404:
      return "sessionNotFound"
    case 429:
      return "rateLimited"
    default:
      return status >= 500 ? "serverError" : "invalidRequest"
  }
}

export type CreatePhoneVerificationParams = {
  /** Unique session identifier (UUID recommended). */
  sessionId: string
  /**
   * Verification flow variant.
   * @default "phone"
   */
  flow?: PhoneVerificationFlow
  /**
   * Provider user id (or linked external id) the responder must match.
   * Required when `flow` is `"2fa"`.
   */
  userId?: string
  /** URL the user is sent back to after completing verification in WhatsApp. */
  callbackURL?: string
}

/** WhatsApp entry points for a verification session. */
export type PhoneVerificationWhatsApp = {
  /** Verification bot phone number. */
  number: string
  /** Short link intended for QR codes; redirects into WhatsApp. */
  deepLink: string
  /** `wa.me` link with the pre-filled message; opens WhatsApp directly. */
  directLink: string
}

/** A verification session as returned by `createVerification`. */
export type PhoneVerificationSession = {
  sessionId: string
  status: PhoneVerificationStatus
  whatsApp: PhoneVerificationWhatsApp
  /** Hosted fallback page for the verification. */
  webLink?: string
  /** Unix epoch milliseconds when the session expires. */
  expiresAt?: number
  /**
   * Single-use provider token for webview embedding and webhook correlation.
   * Server-side only — `createPhoneVerificationHandler` strips it before
   * responding to the browser.
   */
  token?: string
}

export type GetPhoneVerificationStatusParams = {
  sessionId: string
  /** Flow the session was created with — affects the result shape. */
  flow?: PhoneVerificationFlow
}

export type CancelPhoneVerificationParams = {
  sessionId: string
}

/** Result of a status check. Fields beyond `status` depend on the flow. */
export type PhoneVerificationResult = {
  sessionId: string
  status: PhoneVerificationStatus
  /** Verified phone number in E.164 format (`phone` flow, once verified). */
  phoneNumber?: string
  /** Stable provider user id (`phone` and `login` flows, once verified). */
  userId?: string
  /** Whether the user was auto-registered (`login` flow). */
  isNewUser?: boolean
  /** Whether the responder matched the expected user (`2fa` flow). */
  matched?: boolean
}

/**
 * Transport-agnostic phone verification provider.
 *
 * Implemented both by server-side REST providers (e.g. `phoneVerif`) and by
 * the browser client that proxies through the developer's backend, so hooks
 * and components never perform low-level API calls themselves.
 */
export interface PhoneVerificationProvider {
  /** Start a new verification session. */
  createVerification(
    params: CreatePhoneVerificationParams
  ): Promise<PhoneVerificationSession>
  /** Check the current status of a session. */
  getVerificationStatus(
    params: GetPhoneVerificationStatusParams
  ): Promise<PhoneVerificationResult>
  /** Cancel a session so its status resolves to `"cancelled"`. */
  cancelVerification(
    params: CancelPhoneVerificationParams
  ): Promise<PhoneVerificationResult>
}
