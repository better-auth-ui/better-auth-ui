import {
  type CreatePhoneVerificationParams,
  PhoneVerificationError,
  type PhoneVerificationErrorCode,
  type PhoneVerificationFlow,
  type PhoneVerificationProvider,
  type PhoneVerificationResult,
  phoneVerificationTerminalStatuses
} from "@better-auth-ui/core/plugins"

import {
  createMemoryPhoneVerificationStore,
  type PhoneVerificationStore
} from "./phone-verification-store"

export type PhoneVerificationWebhookOptions = {
  /**
   * HMAC-SHA256 signing secret used to verify `X-Webhook-Signature` headers.
   * Retrieve it once from the provider (Phone Verif: `GET /webhook-secret`)
   * and store it as a server-side secret.
   */
  secret: string
}

export type PhoneVerificationHandlerOptions = {
  /** Server-side verification provider (e.g. `phoneVerif({ apiKey })`). */
  provider: PhoneVerificationProvider
  /**
   * Enable the `/webhook` sub-route for real-time results. Without it the
   * handler falls back to proxying status polls to the provider.
   */
  webhook?: PhoneVerificationWebhookOptions
  /**
   * Storage for webhook results and cancellations.
   * @default createMemoryPhoneVerificationStore()
   */
  store?: PhoneVerificationStore
  /**
   * Flows the browser is allowed to start.
   * @default ["phone"]
   */
  flows?: PhoneVerificationFlow[]
  /**
   * Called when a session reaches `"verified"` — update your database here
   * (e.g. set `phoneNumber` / `phoneNumberVerified` on the Better Auth user).
   * May fire from both the webhook and a status poll, so keep it idempotent.
   */
  onVerified?: (result: PhoneVerificationResult) => void | Promise<void>
}

/** Raw webhook payload shape sent by Phone Verif. */
type PhoneVerificationWebhookPayload = {
  event?: string
  session_id?: string
  validation_token?: string
  validated_phone_number?: string
  user_id?: string
  is_new_user?: boolean
  match?: boolean
  status?: string
}

const errorStatusByCode: Record<PhoneVerificationErrorCode, number> = {
  invalidRequest: 400,
  unauthorized: 401,
  insufficientCredits: 402,
  sessionNotFound: 404,
  rateLimited: 429,
  serverError: 502,
  networkError: 502,
  invalidResponse: 502
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  })

const errorResponse = (error: unknown) => {
  if (error instanceof PhoneVerificationError) {
    return json(
      { code: error.code, message: error.message },
      errorStatusByCode[error.code] ?? 500
    )
  }

  return json({ code: "serverError", message: "Internal error" }, 500)
}

const encoder = new TextEncoder()

/**
 * Verify a webhook signature: `HMAC-SHA256(secret, rawBody)` hex-encoded,
 * sent as `sha256=<hex>` in the `X-Webhook-Signature` header. Uses a
 * constant-time comparison to avoid timing attacks.
 */
export async function verifyPhoneVerificationWebhook(
  rawBody: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) return false

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

  const expected = `sha256=${Array.from(digest, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("")}`

  if (signature.length !== expected.length) return false

  let mismatch = 0
  for (let i = 0; i < expected.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i)
  }

  return mismatch === 0
}

const isTerminal = (result: PhoneVerificationResult | undefined) =>
  !!result && phoneVerificationTerminalStatuses.includes(result.status)

/** Store key aliasing a provider token to its session id. */
const tokenKey = (token: string) => `token:${token}`

/**
 * Create request handlers that expose a phone verification provider to the
 * browser without leaking its API key.
 *
 * Routes (relative to wherever the handler is mounted):
 * - `POST` — create a verification session
 * - `GET ?sessionId=` — check status (store first, then provider)
 * - `DELETE ?sessionId=` — cancel a session
 * - `POST <mount>/webhook` — signed provider webhook (when configured)
 *
 * Built on Web `Request`/`Response`, so the same handler works in Next.js
 * route handlers, TanStack Start server routes, Remix resource routes, Bun,
 * and anything else speaking the Fetch API.
 *
 * @example
 * ```ts
 * // app/api/phone-verification/[[...route]]/route.ts
 * import { createPhoneVerificationHandler, phoneVerif } from "@better-auth-ui/react/server"
 *
 * export const { GET, POST, DELETE } = createPhoneVerificationHandler({
 *   provider: phoneVerif({ apiKey: process.env.PHONE_VERIF_API_KEY }),
 *   webhook: { secret: process.env.PHONE_VERIF_WEBHOOK_SECRET! },
 *   onVerified: async ({ sessionId, phoneNumber }) => {
 *     // Persist the verified phone number for this session.
 *   }
 * })
 * ```
 */
export function createPhoneVerificationHandler(
  options: PhoneVerificationHandlerOptions
) {
  const {
    provider,
    webhook,
    store = createMemoryPhoneVerificationStore(),
    flows = ["phone"],
    onVerified
  } = options

  const notifyVerified = async (result: PhoneVerificationResult) => {
    if (result.status !== "verified") return
    await onVerified?.(result)
  }

  const handleWebhook = async (request: Request): Promise<Response> => {
    if (!webhook) {
      return json(
        { code: "invalidRequest", message: "Webhook not configured" },
        404
      )
    }

    const rawBody = await request.text()
    const valid = await verifyPhoneVerificationWebhook(
      rawBody,
      request.headers.get("X-Webhook-Signature"),
      webhook.secret
    )

    if (!valid) {
      return json({ code: "unauthorized", message: "Invalid signature" }, 401)
    }

    let payload: PhoneVerificationWebhookPayload
    try {
      payload = JSON.parse(rawBody) as PhoneVerificationWebhookPayload
    } catch {
      return json({ code: "invalidRequest", message: "Invalid JSON body" }, 400)
    }

    // Payloads carry `session_id` on flow-aware events; older shapes only
    // include `validation_token`, resolved through the alias stored on create.
    let sessionId = payload.session_id
    if (!sessionId && payload.validation_token) {
      const alias = await store.get(tokenKey(payload.validation_token))
      sessionId = alias?.sessionId
    }

    if (!sessionId) {
      return json({ code: "invalidRequest", message: "Unknown session" }, 400)
    }

    const result: PhoneVerificationResult = {
      sessionId,
      status: payload.event === "verification_success" ? "verified" : "failed",
      phoneNumber: payload.validated_phone_number,
      userId: payload.user_id,
      isNewUser: payload.is_new_user,
      matched: payload.match
    }

    await store.set(sessionId, result)
    await notifyVerified(result)

    return json({ received: true })
  }

  const handleCreate = async (request: Request): Promise<Response> => {
    let body: Partial<CreatePhoneVerificationParams>
    try {
      body = (await request.json()) as Partial<CreatePhoneVerificationParams>
    } catch {
      return json({ code: "invalidRequest", message: "Invalid JSON body" }, 400)
    }

    if (typeof body.sessionId !== "string" || !body.sessionId) {
      return json({ code: "invalidRequest", message: "Missing sessionId" }, 400)
    }

    const flow = body.flow ?? "phone"
    if (!flows.includes(flow)) {
      return json(
        { code: "invalidRequest", message: `Flow "${flow}" is not enabled` },
        400
      )
    }

    const session = await provider.createVerification({
      sessionId: body.sessionId,
      flow,
      userId: typeof body.userId === "string" ? body.userId : undefined,
      callbackURL:
        typeof body.callbackURL === "string" ? body.callbackURL : undefined
    })

    // Alias the provider token so webhooks without `session_id` still map
    // back to this session.
    if (session.token) {
      await store.set(tokenKey(session.token), {
        sessionId: session.sessionId,
        status: session.status
      })
    }

    // The provider token is a single-use server credential — never send it
    // to the browser.
    const { token: _token, ...clientSession } = session
    return json(clientSession)
  }

  const handleStatus = async (request: Request): Promise<Response> => {
    const url = new URL(request.url)
    const sessionId = url.searchParams.get("sessionId")

    if (!sessionId) {
      return json({ code: "invalidRequest", message: "Missing sessionId" }, 400)
    }

    const stored = await store.get(sessionId)
    if (isTerminal(stored)) return json(stored)

    const result = await provider.getVerificationStatus({
      sessionId,
      flow: (url.searchParams.get("flow") as PhoneVerificationFlow) ?? undefined
    })

    if (isTerminal(result)) {
      await store.set(sessionId, result)
      await notifyVerified(result)
    }

    return json(result)
  }

  const handleCancel = async (request: Request): Promise<Response> => {
    const url = new URL(request.url)
    const sessionId = url.searchParams.get("sessionId")

    if (!sessionId) {
      return json({ code: "invalidRequest", message: "Missing sessionId" }, 400)
    }

    // A session that already reached a terminal state can't be cancelled.
    const stored = await store.get(sessionId)
    if (isTerminal(stored)) return json(stored)

    const result = await provider.cancelVerification({ sessionId })
    await store.set(sessionId, result)

    return json(result)
  }

  const handler = async (request: Request): Promise<Response> => {
    try {
      const { pathname } = new URL(request.url)

      if (request.method === "POST" && pathname.endsWith("/webhook")) {
        return await handleWebhook(request)
      }

      switch (request.method) {
        case "POST":
          return await handleCreate(request)
        case "GET":
          return await handleStatus(request)
        case "DELETE":
          return await handleCancel(request)
        default:
          return json(
            { code: "invalidRequest", message: "Method not allowed" },
            405
          )
      }
    } catch (error) {
      return errorResponse(error)
    }
  }

  return { handler, GET: handler, POST: handler, DELETE: handler }
}
