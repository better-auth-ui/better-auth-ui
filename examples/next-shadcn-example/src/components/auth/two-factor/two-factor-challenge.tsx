"use client"

import {
  clearTwoFactorMethods,
  readTwoFactorMethods,
  type TwoFactorMethod
} from "@better-auth-ui/core/plugins"
import {
  type TwoFactorAuthClient,
  useAuth,
  useAuthPlugin,
  useSendTwoFactorOtp,
  useVerifyBackupCode,
  useVerifyTotp,
  useVerifyTwoFactorOtp
} from "@better-auth-ui/react"
import { type SyntheticEvent, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { twoFactorPlugin } from "@/lib/auth/two-factor-plugin"
import {
  RESEND_COOLDOWN_SECONDS,
  useResendCooldown
} from "@/lib/auth/use-resend-cooldown"
import { cn } from "@/lib/utils"
import { OtpField } from "../otp-field"
import { useIsHydrated } from "../use-is-hydrated"

/** Challenge surfaces the view can render, in the order they are offered. */
type ChallengeMethod = TwoFactorMethod | "backup"

export type TwoFactorChallengeProps = {
  className?: string
}

/**
 * Second-factor challenge that finishes a pending sign-in.
 *
 * Better Auth answers a password sign-in with `twoFactorRedirect` instead of
 * a session, and the shared sign-in continuation sends the browser here with
 * the enabled methods in session storage. Verifying is what creates the
 * session, after which the original `redirectTo` is resumed.
 *
 * @param className - Additional CSS classes applied to the card.
 */
export function TwoFactorChallenge({ className }: TwoFactorChallengeProps) {
  const {
    authClient,
    basePaths,
    localization,
    navigate,
    redirectTo,
    viewPaths,
    Link
  } = useAuth()
  const {
    backupCodes: backupCodesEnabled,
    codeLength,
    localization: twoFactorLocalization,
    trustDevice: trustDeviceEnabled
  } = useAuthPlugin(twoFactorPlugin)

  const twoFactorClient = authClient as TwoFactorAuthClient
  const isHydrated = useIsHydrated()

  const [methods, setMethods] = useState<TwoFactorMethod[]>(() =>
    isHydrated ? readTwoFactorMethods() : ["totp", "otp"]
  )
  const [method, setMethod] = useState<ChallengeMethod>(
    () => methods[0] ?? "totp"
  )
  const [code, setCode] = useState("")
  const [trustDevice, setTrustDevice] = useState(false)
  const [otpRequested, setOtpRequested] = useState(false)
  const { cooldown, isCoolingDown, startCooldown } = useResendCooldown()

  useEffect(() => {
    const stored = readTwoFactorMethods()
    setMethods(stored)
    setMethod(stored[0] ?? "totp")
  }, [])

  const onVerified = () => {
    clearTwoFactorMethods()
    navigate({ to: redirectTo })
  }

  const { mutate: sendTwoFactorOtp, isPending: isSendingOtp } =
    useSendTwoFactorOtp(twoFactorClient, {
      onSuccess: () => {
        setOtpRequested(true)
        startCooldown(RESEND_COOLDOWN_SECONDS)
      }
    })

  const { mutate: verifyTotp, isPending: isVerifyingTotp } = useVerifyTotp(
    twoFactorClient,
    { onError: () => setCode(""), onSuccess: onVerified }
  )

  const { mutate: verifyTwoFactorOtp, isPending: isVerifyingOtp } =
    useVerifyTwoFactorOtp(twoFactorClient, {
      onError: () => setCode(""),
      onSuccess: onVerified
    })

  const { mutate: verifyBackupCode, isPending: isVerifyingBackupCode } =
    useVerifyBackupCode(twoFactorClient, { onSuccess: onVerified })

  const isPending =
    isSendingOtp || isVerifyingTotp || isVerifyingOtp || isVerifyingBackupCode

  const switchMethod = (next: ChallengeMethod) => {
    setCode("")
    setMethod(next)
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trust = trustDeviceEnabled ? { trustDevice } : {}

    if (method === "backup") {
      const formData = new FormData(e.currentTarget)
      verifyBackupCode({
        code: (formData.get("backupCode") as string).trim(),
        ...trust
      })
      return
    }

    if (method === "otp") {
      verifyTwoFactorOtp({ code, ...trust })
      return
    }

    verifyTotp({ code, ...trust })
  }

  const needsOtpRequest = method === "otp" && !otpRequested

  const description =
    method === "backup"
      ? twoFactorLocalization.backupCodeDescription
      : method === "otp"
        ? twoFactorLocalization.emailedCodeDescription
        : twoFactorLocalization.authenticatorCodeDescription

  const alternatives: { key: ChallengeMethod; label: string }[] = [
    ...(method !== "totp" && methods.includes("totp")
      ? [
          {
            key: "totp" as const,
            label: twoFactorLocalization.useAuthenticator
          }
        ]
      : []),
    ...(method !== "otp" && methods.includes("otp")
      ? [{ key: "otp" as const, label: twoFactorLocalization.useEmailedCode }]
      : []),
    ...(method !== "backup" && backupCodesEnabled
      ? [{ key: "backup" as const, label: twoFactorLocalization.useBackupCode }]
      : [])
  ]

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl">
          {twoFactorLocalization.twoFactor}
        </CardTitle>

        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {method === "backup" ? (
              <Field>
                <FieldLabel htmlFor="backupCode">
                  {twoFactorLocalization.backupCode}
                </FieldLabel>

                <Input
                  id="backupCode"
                  name="backupCode"
                  autoComplete="one-time-code"
                  autoFocus
                  required
                  disabled={isPending}
                />
              </Field>
            ) : (
              <OtpField
                autoFocus
                disabled={isPending || needsOtpRequest}
                label={
                  method === "otp"
                    ? twoFactorLocalization.emailedCode
                    : twoFactorLocalization.authenticatorCode
                }
                length={codeLength}
                name="code"
                value={code}
                onChange={setCode}
              />
            )}

            {trustDeviceEnabled && (
              <Field orientation="horizontal">
                <Checkbox
                  id="trustDevice"
                  name="trustDevice"
                  checked={trustDevice}
                  disabled={isPending}
                  onCheckedChange={(checked) =>
                    setTrustDevice(checked === true)
                  }
                />

                <FieldLabel htmlFor="trustDevice" className="font-normal">
                  {twoFactorLocalization.trustDevice}
                </FieldLabel>
              </Field>
            )}

            <div className="flex flex-col gap-3">
              {needsOtpRequest ? (
                <Button
                  type="button"
                  disabled={isSendingOtp}
                  onClick={() => sendTwoFactorOtp()}
                >
                  {isSendingOtp && <Spinner />}

                  {twoFactorLocalization.sendEmailCode}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={
                    isPending ||
                    (method !== "backup" && code.length !== codeLength)
                  }
                >
                  {isPending && <Spinner />}

                  {twoFactorLocalization.verify}
                </Button>
              )}

              {method === "otp" && otpRequested && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending || isCoolingDown}
                  onClick={() => sendTwoFactorOtp()}
                >
                  {isCoolingDown
                    ? localization.auth.resendIn.replace(
                        "{{seconds}}",
                        String(cooldown)
                      )
                    : localization.auth.resend}
                </Button>
              )}

              {alternatives.map((alternative) => (
                <Button
                  type="button"
                  variant="ghost"
                  key={alternative.key}
                  disabled={isPending}
                  onClick={() => switchMethod(alternative.key)}
                >
                  {alternative.label}
                </Button>
              ))}
            </div>
          </FieldGroup>
        </form>

        <div className="flex flex-col gap-3 items-center w-full mt-4">
          <FieldDescription className="text-center">
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
              className="underline underline-offset-4"
            >
              {twoFactorLocalization.backToSignIn}
            </Link>
          </FieldDescription>
        </div>
      </CardContent>
    </Card>
  )
}
