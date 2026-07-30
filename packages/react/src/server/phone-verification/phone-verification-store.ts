import type { PhoneVerificationResult } from "@better-auth-ui/core/plugins"

/**
 * Server-side storage for verification outcomes recorded outside the polling
 * path (webhook deliveries, cancellations).
 *
 * The default is an in-memory store — sufficient for a single server process.
 * Deployments with multiple instances should provide a shared implementation
 * (e.g. Redis or a database table) so a webhook received by one instance is
 * visible to status reads on another.
 */
export interface PhoneVerificationStore {
  get(
    key: string
  ):
    | Promise<PhoneVerificationResult | undefined>
    | PhoneVerificationResult
    | undefined
  set(key: string, result: PhoneVerificationResult): Promise<void> | void
}

export type MemoryPhoneVerificationStoreOptions = {
  /**
   * Milliseconds an entry is kept before eviction.
   * @default 3600000
   */
  ttl?: number
}

/** In-memory {@link PhoneVerificationStore} with TTL-based eviction. */
export function createMemoryPhoneVerificationStore(
  options: MemoryPhoneVerificationStoreOptions = {}
): PhoneVerificationStore {
  const ttl = options.ttl ?? 3_600_000
  const entries = new Map<
    string,
    { result: PhoneVerificationResult; expiresAt: number }
  >()

  const evictExpired = () => {
    const now = Date.now()

    for (const [key, entry] of entries) {
      if (entry.expiresAt <= now) entries.delete(key)
    }
  }

  return {
    get: (key) => {
      evictExpired()
      return entries.get(key)?.result
    },
    set: (key, result) => {
      evictExpired()
      entries.set(key, { result, expiresAt: Date.now() + ttl })
    }
  }
}
