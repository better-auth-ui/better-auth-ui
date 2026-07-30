import {
  createPhoneVerificationClient,
  PhoneVerificationError,
  type PhoneVerificationProvider,
  type PhoneVerificationResult,
  type PhoneVerificationSession
} from "@better-auth-ui/core/plugins"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createPhoneVerificationHandler } from "../../src/server/phone-verification/phone-verification-handler"

const endpoint = "http://test.local/api/phone-verification"
const webhookSecret = "test-webhook-secret"

const session = (sessionId: string): PhoneVerificationSession => ({
  sessionId,
  status: "pending",
  whatsApp: {
    number: "1234567890",
    deepLink: "https://t.phone-verif.com/qr/xyz",
    directLink: "https://wa.me/1234567890?text=hello"
  },
  token: "validation-token-xyz"
})

const pending = (sessionId: string): PhoneVerificationResult => ({
  sessionId,
  status: "pending"
})

async function signWebhook(rawBody: string, secret: string) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const digest = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody))
  )

  return `sha256=${Array.from(digest, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("")}`
}

describe("createPhoneVerificationHandler", () => {
  let provider: PhoneVerificationProvider
  let onVerified: ReturnType<typeof vi.fn>

  const setup = () => {
    const { handler } = createPhoneVerificationHandler({
      provider,
      webhook: { secret: webhookSecret },
      onVerified
    })

    // Wire the browser client straight into the handler so the endpoint
    // contract is exercised end to end.
    const client = createPhoneVerificationClient({
      endpoint,
      fetch: (input, init) =>
        handler(new Request(input as string | URL | Request, init))
    })

    return { handler, client }
  }

  beforeEach(() => {
    onVerified = vi.fn()
    provider = {
      createVerification: vi.fn(async ({ sessionId }) => session(sessionId)),
      getVerificationStatus: vi.fn(async ({ sessionId }) => pending(sessionId)),
      cancelVerification: vi.fn(async ({ sessionId }) => ({
        sessionId,
        status: "cancelled" as const
      }))
    }
  })

  it("creates a session and strips the provider token from the response", async () => {
    const { client } = setup()

    const created = await client.createVerification({ sessionId: "s1" })

    expect(created.sessionId).toBe("s1")
    expect(created.whatsApp.directLink).toContain("wa.me")
    expect(created.token).toBeUndefined()
    expect(provider.createVerification).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: "s1", flow: "phone" })
    )
  })

  it("rejects flows that are not enabled", async () => {
    const { client } = setup()

    await expect(
      client.createVerification({ sessionId: "s1", flow: "2fa" })
    ).rejects.toMatchObject({ code: "invalidRequest" })
  })

  it("proxies status polls to the provider and notifies on verified", async () => {
    const { client } = setup()
    await client.createVerification({ sessionId: "s1" })

    expect(await client.getVerificationStatus({ sessionId: "s1" })).toEqual(
      pending("s1")
    )
    expect(onVerified).not.toHaveBeenCalled()

    vi.mocked(provider.getVerificationStatus).mockResolvedValueOnce({
      sessionId: "s1",
      status: "verified",
      phoneNumber: "+33612345678"
    })

    const verified = await client.getVerificationStatus({ sessionId: "s1" })
    expect(verified.status).toBe("verified")
    expect(onVerified).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumber: "+33612345678" })
    )

    // Terminal results are stored — later polls skip the provider.
    const calls = vi.mocked(provider.getVerificationStatus).mock.calls.length
    await client.getVerificationStatus({ sessionId: "s1" })
    expect(provider.getVerificationStatus).toHaveBeenCalledTimes(calls)
  })

  it("accepts signed webhooks and serves the result from the store", async () => {
    const { handler, client } = setup()
    await client.createVerification({ sessionId: "s1" })

    const rawBody = JSON.stringify({
      event: "verification_success",
      session_id: "s1",
      validated_phone_number: "+33612345678",
      user_id: "user-uuid"
    })

    const response = await handler(
      new Request(`${endpoint}/webhook`, {
        method: "POST",
        body: rawBody,
        headers: {
          "X-Webhook-Signature": await signWebhook(rawBody, webhookSecret)
        }
      })
    )

    expect(response.status).toBe(200)
    expect(onVerified).toHaveBeenCalledTimes(1)

    const result = await client.getVerificationStatus({ sessionId: "s1" })
    expect(result).toMatchObject({
      status: "verified",
      phoneNumber: "+33612345678",
      userId: "user-uuid"
    })
    expect(provider.getVerificationStatus).not.toHaveBeenCalled()
  })

  it("resolves webhooks without a session_id through the token alias", async () => {
    const { handler, client } = setup()
    await client.createVerification({ sessionId: "s1" })

    const rawBody = JSON.stringify({
      event: "verification_success",
      validation_token: "validation-token-xyz",
      validated_phone_number: "+33612345678"
    })

    const response = await handler(
      new Request(`${endpoint}/webhook`, {
        method: "POST",
        body: rawBody,
        headers: {
          "X-Webhook-Signature": await signWebhook(rawBody, webhookSecret)
        }
      })
    )

    expect(response.status).toBe(200)

    const result = await client.getVerificationStatus({ sessionId: "s1" })
    expect(result.status).toBe("verified")
  })

  it("rejects webhooks with an invalid signature", async () => {
    const { handler } = setup()

    const rawBody = JSON.stringify({ event: "verification_success" })
    const response = await handler(
      new Request(`${endpoint}/webhook`, {
        method: "POST",
        body: rawBody,
        headers: {
          "X-Webhook-Signature": await signWebhook(rawBody, "wrong-secret")
        }
      })
    )

    expect(response.status).toBe(401)
    expect(onVerified).not.toHaveBeenCalled()
  })

  it("cancels a session and keeps it cancelled on later polls", async () => {
    const { client } = setup()
    await client.createVerification({ sessionId: "s1" })

    const cancelled = await client.cancelVerification({ sessionId: "s1" })
    expect(cancelled.status).toBe("cancelled")

    const result = await client.getVerificationStatus({ sessionId: "s1" })
    expect(result.status).toBe("cancelled")
    expect(provider.getVerificationStatus).not.toHaveBeenCalled()
  })

  it("maps provider errors onto HTTP statuses and back into typed errors", async () => {
    const { client } = setup()

    vi.mocked(provider.createVerification).mockRejectedValueOnce(
      new PhoneVerificationError("insufficientCredits", "No credits left")
    )

    await expect(
      client.createVerification({ sessionId: "s1" })
    ).rejects.toMatchObject({
      code: "insufficientCredits",
      status: 402,
      message: "No credits left"
    })
  })
})
