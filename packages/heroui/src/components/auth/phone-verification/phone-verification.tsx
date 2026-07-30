import { useAuthPlugin } from "@better-auth-ui/react"
import { Card, type CardProps, cn } from "@heroui/react"

import { phoneVerificationPlugin } from "../../../lib/auth/phone-verification-plugin"
import {
  PhoneVerificationStep,
  type PhoneVerificationStepProps
} from "./phone-verification-step"

export type PhoneVerificationProps = PhoneVerificationStepProps & {
  variant?: CardProps["variant"]
}

/**
 * WhatsApp phone verification card.
 *
 * Wraps {@link PhoneVerificationStep} in a card matching the other auth
 * views, and is registered at `/auth/phone-verification` by
 * `phoneVerificationPlugin`. Use the step directly to compose the
 * verification into a custom layout.
 *
 * @param variant - Card variant.
 */
export function PhoneVerification({
  className,
  variant,
  ...stepProps
}: PhoneVerificationProps) {
  const { localization: phoneVerificationLocalization } = useAuthPlugin(
    phoneVerificationPlugin
  )

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {phoneVerificationLocalization.verifyYourPhoneNumber}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        <PhoneVerificationStep {...stepProps} />
      </Card.Content>
    </Card>
  )
}
