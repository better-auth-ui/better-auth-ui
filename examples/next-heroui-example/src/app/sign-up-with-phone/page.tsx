"use client"

import { SignUp } from "@better-auth-ui/heroui"
import { PhoneVerificationStep } from "@better-auth-ui/heroui/plugins"
import { Card, Chip, Description } from "@heroui/react"
import { useState } from "react"

/**
 * Demo: phone verification before account creation.
 *
 * The composable `PhoneVerificationStep` gates the sign-up form — the user
 * proves phone ownership through WhatsApp first, then registers. The same
 * step can be dropped after social login, after email sign-up, or inside a
 * dialog (`PhoneVerificationDialog`) as an MFA challenge.
 */
export default function SignUpWithPhonePage() {
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState<string>()
  const [isVerified, setIsVerified] = useState(false)

  return (
    <div className="flex justify-center my-auto p-4 md:p-6">
      {isVerified ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          {verifiedPhoneNumber && (
            <Chip color="success">{verifiedPhoneNumber} verified</Chip>
          )}

          <SignUp className="max-w-none" />
        </div>
      ) : (
        <Card className="w-full max-w-sm gap-4 md:p-6">
          <Card.Header>
            <Card.Title className="text-xl font-semibold mb-1">
              Create your account
            </Card.Title>

            <Description className="text-sm">
              First, verify your phone number with WhatsApp.
            </Description>
          </Card.Header>

          <Card.Content className="gap-4">
            <PhoneVerificationStep
              onVerified={({ phoneNumber }) =>
                setVerifiedPhoneNumber(phoneNumber)
              }
              onContinue={() => setIsVerified(true)}
            />
          </Card.Content>
        </Card>
      )}
    </div>
  )
}
