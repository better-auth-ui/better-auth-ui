import { createServerFn } from "@tanstack/solid-start"
import { getRequestHeaders } from "@tanstack/solid-start/server"
import { auth, updateApiKeyForUser } from "@/lib/auth"

export type UpdateApiKeyInput = {
  keyId: string
  configId?: string
  name?: string
  enabled?: boolean
  remaining?: number
  refillAmount?: number
  refillInterval?: number
  metadata?: unknown
  rateLimitEnabled?: boolean
  rateLimitTimeWindow?: number
  rateLimitMax?: number
  permissions?: Record<string, string[]> | null
}

const validateUpdateApiKeyInput = (data: UpdateApiKeyInput) => {
  if (!data || typeof data.keyId !== "string" || !data.keyId.trim()) {
    throw new Error("An API key ID is required.")
  }

  return data
}

/** Update an API key through Better Auth's authenticated server API. */
export const updateApiKeyOnServer = createServerFn({ method: "POST" })
  .inputValidator(validateUpdateApiKeyInput)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() })
    if (!session) throw new Error("Unauthorized")

    await updateApiKeyForUser(data, session.user.id)

    return { updated: true }
  })
