import {
  type CancelPhoneVerificationParams,
  type CreatePhoneVerificationParams,
  type GetPhoneVerificationStatusParams,
  PhoneVerificationError,
  type PhoneVerificationProvider,
  type PhoneVerificationResult,
  type PhoneVerificationSession,
  type PhoneVerificationStatus,
  phoneVerificationErrorCodeFromStatus
} from "@better-auth-ui/core/plugins"

export type PhoneVerifOptions = {
  /**
   * Phone Verif API key. Server-side secret — never expose it to the browser.
   * @default process.env.PHONE_VERIF_API_KEY
   */
  apiKey?: string
  /**
   * Phone Verif API base URL.
   * @default "https://api.phone-verif.com"
   */
  baseURL?: string
  /**
   * Custom fetch implementation.
   * @default globalThis.fetch
   */
  fetch?: typeof fetch
}

/** Raw session shape returned by the Phone Verif API. */
type PhoneVerifSessionPayload = {
  session_id?: string
  validation_token?: string
  status?: string
  validity_timestamp?: number | string
  validated_phone_number?: string | null
  user_id?: string
}

/** Raw response shape shared by `/start-verification` and `/check-verification-status`. */
type PhoneVerifResponse = {
  session?: PhoneVerifSessionPayload
  links?: { web?: string }
  whatsapp?: { number?: string; deeplink?: string; direct_link?: string }
  // Flow-aware `/check-verification-status` responses are flat.
  status?: string
  validated_phone_number?: string
  user_id?: string
  is_new_user?: boolean
  match?: boolean
}

const knownStatuses: PhoneVerificationStatus[] = [
  "pending",
  "verified",
  "expired",
  "cancelled",
  "timeout",
  "failed"
]

function normalizeStatus(status: string | undefined): PhoneVerificationStatus {
  return knownStatuses.includes(status as PhoneVerificationStatus)
    ? (status as PhoneVerificationStatus)
    : "failed"
}

/** `validity_timestamp` arrives as unix seconds or an ISO string. */
function normalizeExpiresAt(
  timestamp: number | string | undefined
): number | undefined {
  if (timestamp === undefined) return undefined
  if (typeof timestamp === "number") return timestamp * 1000

  const parsed = Date.parse(timestamp)
  return Number.isNaN(parsed) ? undefined : parsed
}

function toResult(
  sessionId: string,
  payload: PhoneVerifResponse
): PhoneVerificationResult {
  const session = payload.session

  return {
    sessionId,
    status: normalizeStatus(session?.status ?? payload.status),
    phoneNumber:
      session?.validated_phone_number ??
      payload.validated_phone_number ??
      undefined,
    userId: session?.user_id ?? payload.user_id,
    isNewUser: payload.is_new_user,
    matched: payload.match
  }
}

/**
 * Phone Verif (phone-verif.com) provider — verifies phone number ownership
 * through a pre-filled WhatsApp message instead of an SMS OTP.
 *
 * Server-only: requires the `PHONE_VERIF_API_KEY` secret. Expose it to the
 * browser through `createPhoneVerificationHandler`, never directly.
 *
 * @example
 * ```ts
 * import { createPhoneVerificationHandler, phoneVerif } from "@better-auth-ui/react/server"
 *
 * export const { GET, POST, DELETE } = createPhoneVerificationHandler({
 *   provider: phoneVerif({ apiKey: process.env.PHONE_VERIF_API_KEY })
 * })
 * ```
 */
// `process` isn't typed here — the package targets browser and server
// runtimes alike, so read env vars defensively off `globalThis`.
const env = (
  globalThis as {
    process?: { env?: Record<string, string | undefined> }
  }
).process?.env

export function phoneVerif(
  options: PhoneVerifOptions = {}
): PhoneVerificationProvider {
  const apiKey = options.apiKey ?? env?.PHONE_VERIF_API_KEY
  const baseURL = options.baseURL ?? "https://api.phone-verif.com"
  const fetchImpl = options.fetch ?? ((...args) => globalThis.fetch(...args))

  if (!apiKey) {
    throw new PhoneVerificationError(
      "unauthorized",
      "phoneVerif: missing API key. Set the PHONE_VERIF_API_KEY environment variable or pass `apiKey`."
    )
  }

  const request = async (path: string, init?: RequestInit) => {
    let response: Response

    try {
      response = await fetchImpl(`${baseURL}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
          ...init?.headers
        }
      })
    } catch (cause) {
      throw new PhoneVerificationError(
        "networkError",
        "Phone Verif request failed to reach the API",
        { cause }
      )
    }

    if (!response.ok) {
      throw new PhoneVerificationError(
        phoneVerificationErrorCodeFromStatus(response.status),
        `Phone Verif request failed with status ${response.status}`,
        { status: response.status }
      )
    }

    try {
      return (await response.json()) as PhoneVerifResponse
    } catch (cause) {
      throw new PhoneVerificationError(
        "invalidResponse",
        "Phone Verif API returned an invalid response",
        { cause }
      )
    }
  }

  return {
    createVerification: async (
      params: CreatePhoneVerificationParams
    ): Promise<PhoneVerificationSession> => {
      const searchParams = new URLSearchParams()
      if (params.flow && params.flow !== "phone") {
        searchParams.set("flow", params.flow)
        if (params.userId) searchParams.set("user_id", params.userId)
      }

      const query = searchParams.size ? `?${searchParams.toString()}` : ""

      const payload = await request(`/start-verification${query}`, {
        method: "POST",
        body: JSON.stringify({
          session_id: params.sessionId,
          callback_url: params.callbackURL,
          is_public: false
        })
      })

      const session = payload.session
      const whatsApp = payload.whatsapp

      if (!whatsApp?.deeplink || !whatsApp.direct_link || !whatsApp.number) {
        throw new PhoneVerificationError(
          "invalidResponse",
          "Phone Verif API response is missing WhatsApp links"
        )
      }

      return {
        sessionId: session?.session_id ?? params.sessionId,
        status: normalizeStatus(session?.status),
        whatsApp: {
          number: whatsApp.number,
          deepLink: whatsApp.deeplink,
          directLink: whatsApp.direct_link
        },
        webLink: payload.links?.web,
        expiresAt: normalizeExpiresAt(session?.validity_timestamp),
        token: session?.validation_token
      }
    },

    getVerificationStatus: async (
      params: GetPhoneVerificationStatusParams
    ): Promise<PhoneVerificationResult> => {
      const payload = await request(
        `/check-verification-status?${new URLSearchParams({
          session_id: params.sessionId
        })}`
      )

      return toResult(params.sessionId, payload)
    },

    // Phone Verif has no cancel endpoint — sessions simply expire. Cancelling
    // resolves locally; `createPhoneVerificationHandler` records the outcome
    // in its store so later status reads stay `"cancelled"`.
    cancelVerification: async (
      params: CancelPhoneVerificationParams
    ): Promise<PhoneVerificationResult> => ({
      sessionId: params.sessionId,
      status: "cancelled"
    })
  }
}
