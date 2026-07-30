import { useAuthPlugin, WhatsApp } from "@better-auth-ui/react"
import { AlertDialog } from "@heroui/react"

import { phoneVerificationPlugin } from "../../../lib/auth/phone-verification-plugin"
import {
  PhoneVerificationStep,
  type PhoneVerificationStepProps
} from "./phone-verification-step"

export type PhoneVerificationDialogProps = Omit<
  PhoneVerificationStepProps,
  "onContinue"
> & {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * WhatsApp phone verification inside a dialog — for verifying mid-session
 * (e.g. after social login or before a sensitive action) without leaving the
 * page.
 *
 * The verification session is only created while the dialog is open, and the
 * success state's continue action closes the dialog.
 */
export function PhoneVerificationDialog({
  isOpen,
  onOpenChange,
  ...stepProps
}: PhoneVerificationDialogProps) {
  const { localization: phoneVerificationLocalization } = useAuthPlugin(
    phoneVerificationPlugin
  )

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <AlertDialog.CloseTrigger />

          <AlertDialog.Header>
            <AlertDialog.Icon status="default">
              <WhatsApp className="size-4" />
            </AlertDialog.Icon>

            <AlertDialog.Heading>
              {phoneVerificationLocalization.verifyYourPhoneNumber}
            </AlertDialog.Heading>
          </AlertDialog.Header>

          <AlertDialog.Body className="overflow-visible">
            {isOpen && (
              <PhoneVerificationStep
                {...stepProps}
                onContinue={() => onOpenChange(false)}
              />
            )}
          </AlertDialog.Body>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
