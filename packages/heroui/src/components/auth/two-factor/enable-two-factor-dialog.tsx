import { createQrCodeSvgData } from "@better-auth-ui/core"
import {
  type TwoFactorAuthClient,
  useAuth,
  useAuthPlugin,
  useEnableTwoFactor,
  useVerifyTotp
} from "@better-auth-ui/react"
import { ShieldCheck } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import { type SyntheticEvent, useMemo, useState } from "react"

import { twoFactorPlugin } from "../../../lib/auth/two-factor-plugin"
import { useTwoFactorPasswordRequirement } from "../../../lib/auth/use-two-factor-password"
import { OtpField } from "../otp-field"
import { BackupCodes } from "./backup-codes"

type EnrollmentStep = "password" | "verify" | "backupCodes"

export type EnableTwoFactorDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Three-step two-factor enrollment: confirm the password, scan the QR code
 * and verify a first code, then save the backup codes.
 *
 * Better Auth only marks two-factor as active once a TOTP code verifies, so
 * the dialog never closes on the enable call alone.
 *
 * @param isOpen - Whether the dialog is open.
 * @param onOpenChange - Called when the dialog requests an open state change.
 */
export function EnableTwoFactorDialog({
  isOpen,
  onOpenChange
}: EnableTwoFactorDialogProps) {
  const { authClient, localization } = useAuth()
  const { codeLength, localization: twoFactorLocalization } =
    useAuthPlugin(twoFactorPlugin)
  const { isPending: isResolvingPasswordRequirement, requiresPassword } =
    useTwoFactorPasswordRequirement()

  const twoFactorClient = authClient as TwoFactorAuthClient

  const [step, setStep] = useState<EnrollmentStep>("password")
  const [totpUri, setTotpUri] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [code, setCode] = useState("")

  const qrCode = useMemo(
    () => (totpUri ? createQrCodeSvgData(totpUri) : null),
    [totpUri]
  )
  // Manual entry fallback for authenticator apps that can't scan. The URI is
  // an `otpauth://` URL, so the secret is just a query parameter.
  const setupKey = useMemo(() => {
    if (!totpUri) return null

    try {
      return new URL(totpUri).searchParams.get("secret")
    } catch {
      return null
    }
  }, [totpUri])

  const {
    mutate: enableTwoFactor,
    isPending: isEnabling,
    reset: resetEnrollment
  } = useEnableTwoFactor(twoFactorClient, {
    onSuccess: (data) => {
      setTotpUri(data.totpURI)
      setBackupCodes(data.backupCodes)
      setStep("verify")
    }
  })

  const { mutate: verifyTotp, isPending: isVerifying } = useVerifyTotp(
    twoFactorClient,
    {
      onError: () => setCode(""),
      onSuccess: () => {
        toast.success(twoFactorLocalization.twoFactorEnabled)
        setStep("backupCodes")
      }
    }
  )

  const isPending = isEnabling || isVerifying || isResolvingPasswordRequirement

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)

    if (!open) {
      setStep("password")
      setTotpUri("")
      setBackupCodes([])
      setCode("")
      // Clears the resolved TOTP URI and backup codes from the mutation cache.
      resetEnrollment()
    }
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (step === "backupCodes") {
      handleOpenChange(false)
      return
    }

    if (step === "verify") {
      verifyTotp({ code })
      return
    }

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string

    enableTwoFactor(requiresPassword ? { password } : {})
  }

  const submitLabel =
    step === "backupCodes"
      ? twoFactorLocalization.done
      : step === "verify"
        ? twoFactorLocalization.verify
        : twoFactorLocalization.enableTwoFactor

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <Form onSubmit={handleSubmit}>
            <AlertDialog.CloseTrigger />

            <AlertDialog.Header>
              <AlertDialog.Icon status="default">
                <ShieldCheck />
              </AlertDialog.Icon>

              <AlertDialog.Heading>
                {twoFactorLocalization.twoFactor}
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body className="overflow-visible">
              {step === "password" && (
                <>
                  <p className="text-muted text-sm">
                    {requiresPassword
                      ? twoFactorLocalization.passwordConfirmation
                      : twoFactorLocalization.twoFactorDescription}
                  </p>

                  {requiresPassword && (
                    <TextField
                      className="mt-4"
                      name="password"
                      autoComplete="current-password"
                      isDisabled={isPending}
                    >
                      <Label>{localization.auth.password}</Label>

                      <Input
                        autoFocus
                        required
                        type="password"
                        placeholder={localization.auth.passwordPlaceholder}
                        variant="secondary"
                      />

                      <FieldError />
                    </TextField>
                  )}
                </>
              )}

              {step === "verify" && (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-muted text-sm">
                    {twoFactorLocalization.scanQrCode}
                  </p>

                  {qrCode && (
                    <svg
                      aria-hidden="true"
                      className="size-44 rounded-lg border border-border"
                      viewBox={`0 0 ${qrCode.size} ${qrCode.size}`}
                    >
                      <path
                        fill="white"
                        d={`M0 0h${qrCode.size}v${qrCode.size}H0z`}
                      />
                      <path
                        fill="black"
                        d={qrCode.path}
                        shapeRendering="crispEdges"
                      />
                    </svg>
                  )}

                  {setupKey && (
                    <div className="flex w-full flex-col gap-1">
                      <p className="text-muted text-xs">
                        {twoFactorLocalization.setupKey}
                      </p>
                      <code className="break-all rounded-lg border border-border bg-surface-secondary p-2 text-xs">
                        {setupKey}
                      </code>
                    </div>
                  )}

                  <OtpField
                    autoFocus
                    className="w-full"
                    isDisabled={isPending}
                    label={twoFactorLocalization.authenticatorCode}
                    length={codeLength}
                    name="code"
                    value={code}
                    onChange={setCode}
                  />
                </div>
              )}

              {step === "backupCodes" && <BackupCodes codes={backupCodes} />}
            </AlertDialog.Body>

            <AlertDialog.Footer>
              {step !== "backupCodes" && (
                <Button slot="close" variant="tertiary" isDisabled={isPending}>
                  {localization.settings.cancel}
                </Button>
              )}

              <Button
                type="submit"
                isDisabled={step === "verify" && code.length !== codeLength}
                isPending={isPending}
              >
                {isPending && <Spinner color="current" size="sm" />}

                {submitLabel}
              </Button>
            </AlertDialog.Footer>
          </Form>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
