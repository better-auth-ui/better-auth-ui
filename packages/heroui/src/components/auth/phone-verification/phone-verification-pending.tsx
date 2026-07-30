import type { PhoneVerificationSession } from "@better-auth-ui/core/plugins"
import { useAuthPlugin, WhatsApp } from "@better-auth-ui/react"
import { Button, cn, Description, Spinner } from "@heroui/react"

import { phoneVerificationPlugin } from "../../../lib/auth/phone-verification-plugin"
import { PhoneVerificationQr } from "./phone-verification-qr"

export type PhoneVerificationPendingProps = {
  /** Active verification session with WhatsApp links. */
  session: PhoneVerificationSession
  /** Whether the page runs on a mobile device (open WhatsApp directly). */
  isMobileDevice?: boolean
  /** Rendered size of the QR code in pixels. Defaults to the plugin's `qrSize`. */
  qrSize?: number
  /** Open WhatsApp with the pre-filled verification message. */
  onOpenWhatsApp: () => void
  /** Cancel the verification. Omit to hide the cancel action. */
  onCancel?: () => void
  className?: string
}

/**
 * Pending state of a WhatsApp phone verification: a QR code on desktop, a
 * "Continue with WhatsApp" button on mobile, and a live status line while
 * waiting for the user's message.
 *
 * @param session - Active verification session.
 * @param isMobileDevice - Switches from QR code to a direct WhatsApp button.
 * @param qrSize - QR code size in pixels. Defaults to the plugin's `qrSize`.
 */
export function PhoneVerificationPending({
  session,
  isMobileDevice,
  qrSize,
  onOpenWhatsApp,
  onCancel,
  className
}: PhoneVerificationPendingProps) {
  const { localization: phoneVerificationLocalization, qrSize: pluginQrSize } =
    useAuthPlugin(phoneVerificationPlugin)

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <Description className="text-sm text-center">
        {isMobileDevice
          ? phoneVerificationLocalization.openWhatsAppDescription
          : phoneVerificationLocalization.scanQrCodeDescription}
      </Description>

      {isMobileDevice ? (
        <Button className="w-full gap-2" onPress={onOpenWhatsApp}>
          <WhatsApp className="size-4" />

          {phoneVerificationLocalization.continueWithWhatsApp}
        </Button>
      ) : (
        <>
          <PhoneVerificationQr
            value={session.whatsApp.deepLink}
            label={phoneVerificationLocalization.qrCodeLabel}
            size={qrSize ?? pluginQrSize}
          />

          <Button
            className="w-full gap-2"
            variant="tertiary"
            onPress={onOpenWhatsApp}
          >
            <WhatsApp className="size-4" />

            {phoneVerificationLocalization.openWhatsApp}
          </Button>
        </>
      )}

      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 text-muted text-sm"
      >
        <Spinner color="current" size="sm" />

        {phoneVerificationLocalization.waitingForVerification}
      </div>

      {onCancel && (
        <Button className="w-full" variant="tertiary" onPress={onCancel}>
          {phoneVerificationLocalization.cancel}
        </Button>
      )}
    </div>
  )
}
