import {
  type CancelPhoneVerificationParams,
  type CreatePhoneVerificationParams,
  type GetPhoneVerificationStatusParams,
  PhoneVerificationError,
  type PhoneVerificationProvider,
  type PhoneVerificationResult,
  type PhoneVerificationSession,
  phoneVerificationErrorCodeFromStatus
} from "./phone-verification-provider"

export type PhoneVerificationClientOptions = {
  /**
   * Backend endpoint that proxies to the verification provider. Handled by
   * `createPhoneVerificationHandler` from `@better-auth-ui/react/server`.
   * @default "/api/phone-verification"
   */
  endpoint?: string
  /**
   * Custom fetch implementation.
   * @default globalThis.fetch
   */
  fetch?: typeof fetch
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Phone verification request failed with status ${response.status}`

    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      // Non-JSON error body — keep the status-based message.
    }

    throw new PhoneVerificationError(
      phoneVerificationErrorCodeFromStatus(response.status),
      message,
      { status: response.status }
    )
  }

  try {
    return (await response.json()) as T
  } catch (cause) {
    throw new PhoneVerificationError(
      "invalidResponse",
      "Phone verification endpoint returned an invalid response",
      { cause }
    )
  }
}

/**
 * Browser-side {@link PhoneVerificationProvider} that talks to the
 * developer's backend instead of the verification provider directly, so API
 * keys never reach the client.
 *
 * The endpoint contract matches `createPhoneVerificationHandler`:
 * - `POST endpoint` — create a session
 * - `GET endpoint?sessionId=` — check status
 * - `DELETE endpoint?sessionId=` — cancel
 *
 * @example
 * ```ts
 * const client = createPhoneVerificationClient({ endpoint: "/api/phone-verification" })
 * const session = await client.createVerification({ sessionId: crypto.randomUUID() })
 * ```
 */
export function createPhoneVerificationClient(
  options: PhoneVerificationClientOptions = {}
): PhoneVerificationProvider {
  const endpoint = options.endpoint ?? "/api/phone-verification"
  const fetchImpl = options.fetch ?? ((...args) => globalThis.fetch(...args))

  const request = async <T>(input: string, init?: RequestInit) => {
    let response: Response

    try {
      response = await fetchImpl(input, init)
    } catch (cause) {
      throw new PhoneVerificationError(
        "networkError",
        "Phone verification request failed to reach the server",
        { cause }
      )
    }

    return parseResponse<T>(response)
  }

  const statusUrl = (params: GetPhoneVerificationStatusParams) => {
    const searchParams = new URLSearchParams({ sessionId: params.sessionId })
    if (params.flow) searchParams.set("flow", params.flow)
    return `${endpoint}?${searchParams.toString()}`
  }

  return {
    createVerification: (params: CreatePhoneVerificationParams) =>
      request<PhoneVerificationSession>(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      }),

    getVerificationStatus: (params: GetPhoneVerificationStatusParams) =>
      request<PhoneVerificationResult>(statusUrl(params)),

    cancelVerification: (params: CancelPhoneVerificationParams) =>
      request<PhoneVerificationResult>(
        `${endpoint}?${new URLSearchParams({ sessionId: params.sessionId })}`,
        { method: "DELETE" }
      )
  }
}
