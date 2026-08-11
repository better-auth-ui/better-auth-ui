"use client"

import { createQrCodeSvgData } from "@better-auth-ui/core"
import {
  type TwoFactorAuthClient,
  useAuth,
  useAuthPlugin,
  useCopyToClipboard,
  useEnableTwoFactor,
  useVerifyTotp
} from "@better-auth-ui/react"
import { Check, Copy, ShieldCheck } from "lucide-react"
import { type SyntheticEvent, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { twoFactorPlugin } from "@/lib/auth/two-factor-plugin"
import { useTwoFactorPasswordRequirement } from "@/lib/auth/use-two-factor-password"
import { OtpField } from "../otp-field"
import { BackupCodes } from "./backup-codes"

type EnrollmentStep = "password" | "verify" | "backupCodes"

export type EnableTwoFactorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Three-step two-factor enrollment: confirm the password, scan the QR code
 * and verify a first code, then save the backup codes.
 *
 * Better Auth only marks two-factor as active once a TOTP code verifies, so
 * the dialog never closes on the enable call alone.
 *
 * @param open - Whether the dialog is open.
 * @param onOpenChange - Called when the dialog requests an open state change.
 */
export function EnableTwoFactorDialog({
  open,
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
  const {
    copied: setupKeyCopied,
    copy: copySetupKeyValue,
    reset: resetSetupKeyCopy
  } = useCopyToClipboard({
    onError: () => toast.error(twoFactorLocalization.setupKeyCopyFailed)
  })

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

  const copySetupKey = async () => {
    if (!setupKey) return

    await copySetupKeyValue(setupKey)
  }

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

  const verifyCode = (completedCode: string) => {
    if (isPending || step !== "verify" || completedCode.length !== codeLength) {
      return
    }

    verifyTotp({ code: completedCode })
  }

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)

    if (!nextOpen) {
      setStep("password")
      setTotpUri("")
      setBackupCodes([])
      setCode("")
      resetSetupKeyCopy()
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
      verifyCode(code)
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>
              <ShieldCheck />
              {twoFactorLocalization.twoFactor}
            </DialogTitle>

            <DialogDescription>
              {step === "password" && requiresPassword
                ? twoFactorLocalization.passwordConfirmation
                : step === "verify"
                  ? twoFactorLocalization.scanQrCode
                  : twoFactorLocalization.twoFactorDescription}
            </DialogDescription>
          </DialogHeader>

          {step === "password" && requiresPassword && (
            <Field>
              <FieldLabel htmlFor="two-factor-password">
                {localization.auth.password}
              </FieldLabel>

              <Input
                id="two-factor-password"
                name="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                required
                placeholder={localization.auth.passwordPlaceholder}
                disabled={isPending}
              />

              <FieldError />
            </Field>
          )}

          {step === "verify" && (
            <div className="flex flex-col items-center gap-4">
              {qrCode && (
                <svg
                  aria-hidden="true"
                  className="size-44 rounded-md border"
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
                <Field className="w-full gap-1">
                  <FieldLabel
                    className="text-muted-foreground text-xs"
                    htmlFor="two-factor-setup-key"
                  >
                    {twoFactorLocalization.setupKey}
                  </FieldLabel>

                  <InputGroup>
                    <InputGroupInput
                      className="font-mono text-xs"
                      id="two-factor-setup-key"
                      readOnly
                      value={setupKey}
                    />

                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={
                          setupKeyCopied
                            ? twoFactorLocalization.setupKeyCopied
                            : localization.settings.copyToClipboard
                        }
                        onClick={copySetupKey}
                        size="icon-xs"
                      >
                        {setupKeyCopied ? <Check /> : <Copy />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              )}

              <OtpField
                autoFocus
                className="w-full"
                disabled={isPending}
                label={twoFactorLocalization.authenticatorCode}
                length={codeLength}
                name="code"
                value={code}
                onChange={setCode}
                onComplete={verifyCode}
              />
            </div>
          )}

          {step === "backupCodes" && <BackupCodes codes={backupCodes} />}

          <DialogFooter>
            {step !== "backupCodes" && (
              <DialogClose
                className={buttonVariants({ variant: "outline" })}
                disabled={isPending}
                type="button"
              >
                {localization.settings.cancel}
              </DialogClose>
            )}

            <Button
              type="submit"
              disabled={
                isPending || (step === "verify" && code.length !== codeLength)
              }
            >
              {isPending && <Spinner />}

              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
