import type {
  PhoneVerificationError,
  PhoneVerificationFlow,
  PhoneVerificationResult,
  PhoneVerificationStatus
} from "@better-auth-ui/core/plugins"
import { useAuthPlugin, usePhoneVerification } from "@better-auth-ui/react"
import { ArrowsRotateRight, TriangleExclamation } from "@gravity-ui/icons"
import { Button, cn, Description, Spinner } from "@heroui/react"

import { phoneVerificationPlugin } from "../../../lib/auth/phone-verification-plugin"
import { PhoneVerificationPending } from "./phone-verification-pending"
import { PhoneVerificationSuccess } from "./phone-verification-success"

export type PhoneVerificationStepProps = {
  className?: string
  /** Override the plugin's configured flow. */
  flow?: PhoneVerificationFlow
  /** Provider user id (or linked external id) — required for the `"2fa"` flow. */
  userId?: string
  /** URL the user is sent back to after completing verification in WhatsApp. */
  callbackURL?: string
  /** Rendered size of the QR code in pixels. Defaults to the plugin's `qrSize`. */
  qrSize?: number
  /**
   * Start a verification session on mount.
   * @default true
   */
  autoStart?: boolean
  /** Show a cancel action while pending. @default false */
  showCancel?: boolean
  /** Called once when the session reaches `"verified"`. */
  onVerified?: (result: PhoneVerificationResult) => void
  /** Called when a request fails (network, API, or provider error). */
  onError?: (error: PhoneVerificationError) => void
  /** Rendered as a "Continue" action on the success state. */
  onContinue?: () => void
}

const failureMessageKey: Partial<
  Record<
    PhoneVerificationStatus,
    | "verificationExpired"
    | "verificationFailed"
    | "verificationCancelled"
    | "verificationTimedOut"
  >
> = {
  expired: "verificationExpired",
  failed: "verificationFailed",
  cancelled: "verificationCancelled",
  timeout: "verificationTimedOut"
}

/**
 * Composable WhatsApp phone verification step — drop it anywhere in an auth
 * flow (after email sign-up, after social login, as an MFA challenge, or
 * inside a custom onboarding step).
 *
 * Renders the full lifecycle: loading, pending (QR code on desktop, WhatsApp
 * button on mobile), success, and failure states with retry recovery.
 * Polling stops automatically once verification succeeds.
 *
 * @example
 * ```tsx
 * <PhoneVerificationStep
 *   onVerified={({ phoneNumber }) => savePhoneNumber(phoneNumber)}
 *   onContinue={() => navigate("/welcome")}
 * />
 * ```
 */
export function PhoneVerificationStep({
  className,
  flow,
  userId,
  callbackURL,
  qrSize,
  autoStart,
  showCancel,
  onVerified,
  onError,
  onContinue
}: PhoneVerificationStepProps) {
  const { localization: phoneVerificationLocalization } = useAuthPlugin(
    phoneVerificationPlugin
  )

  const {
    status,
    session,
    error,
    phoneNumber,
    isMobileDevice,
    start,
    retry,
    cancel,
    openWhatsApp
  } = usePhoneVerification({
    flow,
    userId,
    callbackURL,
    autoStart,
    onVerified,
    onError
  })

  if (status === "verified") {
    return (
      <PhoneVerificationSuccess
        className={className}
        phoneNumber={phoneNumber}
        onContinue={onContinue}
      />
    )
  }

  if (status === "pending" && session) {
    return (
      <PhoneVerificationPending
        className={className}
        session={session}
        isMobileDevice={isMobileDevice}
        qrSize={qrSize}
        onOpenWhatsApp={openWhatsApp}
        onCancel={showCancel ? cancel : undefined}
      />
    )
  }

  if (status === "idle" || status === "starting") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn("flex justify-center py-8", className)}
      >
        <Spinner size="sm" />
      </div>
    )
  }

  const failureKey = failureMessageKey[status]

  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center gap-4 text-center", className)}
    >
      <TriangleExclamation aria-hidden className="size-8 text-warning" />

      <div className="flex flex-col gap-1">
        <p className="font-semibold">
          {failureKey
            ? phoneVerificationLocalization[failureKey]
            : phoneVerificationLocalization.verificationFailed}
        </p>

        <Description className="text-sm">
          {error
            ? phoneVerificationLocalization.verificationError
            : phoneVerificationLocalization.startNewVerification}
        </Description>
      </div>

      <Button
        className="w-full gap-2"
        onPress={status === "cancelled" ? start : retry}
      >
        <ArrowsRotateRight />

        {phoneVerificationLocalization.tryAgain}
      </Button>
    </div>
  )
}
