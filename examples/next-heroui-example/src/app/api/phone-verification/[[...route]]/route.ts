import {
  createPhoneVerificationHandler,
  phoneVerif
} from "@better-auth-ui/react/server"

import { mockPhoneVerification } from "@/lib/phone-verification"

// Falls back to a self-verifying mock so the example runs without
// credentials. Set PHONE_VERIF_API_KEY to use the real service.
const provider = process.env.PHONE_VERIF_API_KEY
  ? phoneVerif({ apiKey: process.env.PHONE_VERIF_API_KEY })
  : mockPhoneVerification()

export const { GET, POST, DELETE } = createPhoneVerificationHandler({
  provider,
  // Point the Phone Verif dashboard's webhook URL at
  // /api/phone-verification/webhook for real-time results; without a secret
  // the handler relies on status polling instead.
  webhook: process.env.PHONE_VERIF_WEBHOOK_SECRET
    ? { secret: process.env.PHONE_VERIF_WEBHOOK_SECRET }
    : undefined,
  onVerified: async ({ sessionId, phoneNumber }) => {
    // Persist the verified phone number here (e.g. on the Better Auth user).
    console.log(`Phone verified for session ${sessionId}: ${phoneNumber}`)
  }
})
