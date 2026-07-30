import { useAuthPlugin } from "@better-auth-ui/react"
import { CircleCheckFill } from "@gravity-ui/icons"
import { Button, cn, Description } from "@heroui/react"
import { useEffect, useState } from "react"

import { phoneVerificationPlugin } from "../../../lib/auth/phone-verification-plugin"

export type PhoneVerificationSuccessProps = {
  /** Verified phone number in E.164 format, when available. */
  phoneNumber?: string
  /** Rendered as a "Continue" action. Omit to hide the button. */
  onContinue?: () => void
  className?: string
}

/**
 * Success state of a phone verification: an animated check mark (respecting
 * `prefers-reduced-motion`), the verified phone number when available, and an
 * optional continue action.
 *
 * @param phoneNumber - Verified phone number to display.
 * @param onContinue - Called when the user continues. Omit to hide the button.
 */
export function PhoneVerificationSuccess({
  phoneNumber,
  onContinue,
  className
}: PhoneVerificationSuccessProps) {
  const { localization: phoneVerificationLocalization } = useAuthPlugin(
    phoneVerificationPlugin
  )

  // Mount flag driving the entrance transition; reduced-motion users see the
  // final state immediately via `motion-safe`.
  const [isEntered, setIsEntered] = useState(false)
  useEffect(() => {
    setIsEntered(true)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center gap-4 text-center", className)}
    >
      <CircleCheckFill
        aria-hidden
        className={cn(
          "size-12 text-success motion-safe:transition-all motion-safe:duration-500",
          !isEntered && "motion-safe:scale-50 motion-safe:opacity-0"
        )}
      />

      <div className="flex flex-col gap-1">
        <p className="font-semibold">
          {phoneVerificationLocalization.phoneNumberVerified}
        </p>

        <Description className="text-sm">
          {phoneVerificationLocalization.phoneNumberVerifiedDescription}
        </Description>

        {phoneNumber && <p className="text-sm font-medium">{phoneNumber}</p>}
      </div>

      {onContinue && (
        <Button className="w-full" onPress={onContinue}>
          {phoneVerificationLocalization.continue}
        </Button>
      )}
    </div>
  )
}
