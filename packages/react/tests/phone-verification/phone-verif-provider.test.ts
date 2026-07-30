import { describe, expect, it, vi } from "vitest"

import { phoneVerif } from "../../src/server/phone-verification/phone-verif-provider"

const startVerificationResponse = {
  session: {
    session_id: "abc123",
    validation_token: "xyz789",
    status: "pending",
    validity_timestamp: 1_766_783_503,
    validated_phone_number: null
  },
  links: {
    web: "https://phone-verif.com/check?token=xyz789"
  },
  whatsapp: {
    number: "1234567890",
    deeplink: "https://t.phone-verif.com/qr/xyz789",
    qr_code_url: "https://t.phone-verif.com/qr/xyz789",
    direct_link: "https://wa.me/1234567890?text=Verification"
  }
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  })

describe("phoneVerif", () => {
  it("throws without an API key", () => {
    expect(() => phoneVerif()).toThrow(/missing API key/i)
  })

  it("creates a verification with the documented request shape", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(startVerificationResponse))
    const provider = phoneVerif({ apiKey: "key", fetch: fetchMock })

    const session = await provider.createVerification({
      sessionId: "abc123",
      callbackURL: "https://app.example.com/done"
    })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit
    ]
    expect(url).toBe("https://api.phone-verif.com/start-verification")
    expect(new Headers(init.headers).get("X-API-Key")).toBe("key")
    expect(JSON.parse(init.body as string)).toEqual({
      session_id: "abc123",
      callback_url: "https://app.example.com/done",
      is_public: false
    })

    expect(session).toEqual({
      sessionId: "abc123",
      status: "pending",
      whatsApp: {
        number: "1234567890",
        deepLink: "https://t.phone-verif.com/qr/xyz789",
        directLink: "https://wa.me/1234567890?text=Verification"
      },
      webLink: "https://phone-verif.com/check?token=xyz789",
      expiresAt: 1_766_783_503_000,
      token: "xyz789"
    })
  })

  it("passes flow and user id as query parameters", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(startVerificationResponse))
    const provider = phoneVerif({ apiKey: "key", fetch: fetchMock })

    await provider.createVerification({
      sessionId: "abc123",
      flow: "2fa",
      userId: "user-uuid"
    })

    const [url] = fetchMock.mock.calls[0] as unknown as [string]
    expect(url).toBe(
      "https://api.phone-verif.com/start-verification?flow=2fa&user_id=user-uuid"
    )
  })

  it("parses the full session status response shape", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        session: {
          validation_token: "xyz789",
          status: "verified",
          validated_phone_number: "+1234567890",
          user_id: "user-uuid"
        }
      })
    )
    const provider = phoneVerif({ apiKey: "key", fetch: fetchMock })

    const result = await provider.getVerificationStatus({
      sessionId: "abc123"
    })

    const [url] = fetchMock.mock.calls[0] as unknown as [string]
    expect(url).toBe(
      "https://api.phone-verif.com/check-verification-status?session_id=abc123"
    )
    expect(result).toEqual({
      sessionId: "abc123",
      status: "verified",
      phoneNumber: "+1234567890",
      userId: "user-uuid",
      isNewUser: undefined,
      matched: undefined
    })
  })

  it("parses the flow-aware flat status response shape", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        status: "verified",
        user_id: "user-uuid",
        is_new_user: true
      })
    )
    const provider = phoneVerif({ apiKey: "key", fetch: fetchMock })

    const result = await provider.getVerificationStatus({
      sessionId: "abc123",
      flow: "login"
    })

    expect(result).toMatchObject({
      status: "verified",
      userId: "user-uuid",
      isNewUser: true
    })
  })

  it("maps HTTP error statuses onto typed error codes", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({}, 402))
    const provider = phoneVerif({ apiKey: "key", fetch: fetchMock })

    await expect(
      provider.getVerificationStatus({ sessionId: "abc123" })
    ).rejects.toMatchObject({ code: "insufficientCredits", status: 402 })
  })

  it("cancels locally without calling the API", async () => {
    const fetchMock = vi.fn()
    const provider = phoneVerif({ apiKey: "key", fetch: fetchMock })

    const result = await provider.cancelVerification({ sessionId: "abc123" })

    expect(result).toEqual({ sessionId: "abc123", status: "cancelled" })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
