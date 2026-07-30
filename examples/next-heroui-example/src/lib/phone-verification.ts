import type {
  PhoneVerificationProvider,
  PhoneVerificationStatus
} from "@better-auth-ui/core/plugins"

/**
 * Demo-only provider that auto-verifies every session after a short delay,
 * so the example runs without a Phone Verif API key. Swap it for
 * `phoneVerif({ apiKey })` in production — see `app/api/phone-verification`.
 */
export function mockPhoneVerification(): PhoneVerificationProvider {
  const sessions = new Map<string, { createdAt: number; cancelled?: boolean }>()
  const verifyAfter = 8_000

  const statusFor = (sessionId: string): PhoneVerificationStatus => {
    const session = sessions.get(sessionId)

    if (!session) return "failed"
    if (session.cancelled) return "cancelled"

    return Date.now() - session.createdAt > verifyAfter ? "verified" : "pending"
  }

  return {
    createVerification: async ({ sessionId }) => {
      sessions.set(sessionId, { createdAt: Date.now() })

      const directLink =
        "https://wa.me/15550000000?text=Demo%20verification%20—%20this%20mock%20session%20verifies%20itself%20in%20a%20few%20seconds"

      return {
        sessionId,
        status: "pending",
        whatsApp: {
          number: "15550000000",
          deepLink: directLink,
          directLink
        },
        expiresAt: Date.now() + 300_000
      }
    },

    getVerificationStatus: async ({ sessionId }) => {
      const status = statusFor(sessionId)

      return {
        sessionId,
        status,
        phoneNumber: status === "verified" ? "+15551234567" : undefined
      }
    },

    cancelVerification: async ({ sessionId }) => {
      const session = sessions.get(sessionId)
      if (session) session.cancelled = true

      return { sessionId, status: "cancelled" }
    }
  }
}
