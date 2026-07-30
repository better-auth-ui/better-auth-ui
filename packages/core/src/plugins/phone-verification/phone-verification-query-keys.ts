/**
 * Query key factory for phone verification queries, scoped per verification
 * session rather than per user — sessions exist before an account does.
 */
export const phoneVerificationQueryKeys = {
  all: ["auth", "phoneVerification"] as const,

  statuses: () => [...phoneVerificationQueryKeys.all, "status"] as const,

  status: (sessionId: string | undefined) =>
    [...phoneVerificationQueryKeys.statuses(), sessionId ?? null] as const
} as const
