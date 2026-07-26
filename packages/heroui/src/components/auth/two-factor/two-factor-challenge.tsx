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
import {
  Button,
  Card,
  type CardProps,
  Checkbox,
  cn,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Spinner,
  TextField,
  useIsHydrated
} from "@heroui/react"
import { type SyntheticEvent, useEffect, useState } from "react"

import { twoFactorPlugin } from "../../../lib/auth/two-factor-plugin"
import {
  RESEND_COOLDOWN_SECONDS,
  useResendCooldown
} from "../../../lib/auth/use-resend-cooldown"
import { OtpField } from "../otp-field"

/** Challenge surfaces the view can render, in the order they are offered. */
type ChallengeMethod = TwoFactorMethod | "backup"

export type TwoFactorChallengeProps = {
  className?: string
  variant?: CardProps["variant"]
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
 * @param variant - Card variant.
 */
export function TwoFactorChallenge({
  className,
  variant
}: TwoFactorChallengeProps) {
  const {
    authClient,
    basePaths,
    localization,
    navigate,
    redirectTo,
    viewPaths
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
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {twoFactorLocalization.twoFactor}
        </Card.Title>

        <Card.Description>{description}</Card.Description>
      </Card.Header>

      <Card.Content className="gap-4">
        <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {method === "backup" ? (
            <TextField
              name="backupCode"
              autoComplete="one-time-code"
              isDisabled={isPending}
            >
              <Label>{twoFactorLocalization.backupCode}</Label>

              <Input
                autoFocus
                required
                variant={variant === "transparent" ? "primary" : "secondary"}
              />

              <FieldError />
            </TextField>
          ) : (
            <OtpField
              autoFocus
              isDisabled={isPending || needsOtpRequest}
              label={
                method === "otp"
                  ? twoFactorLocalization.emailedCode
                  : twoFactorLocalization.authenticatorCode
              }
              length={codeLength}
              name="code"
              value={code}
              variant={variant}
              onChange={setCode}
            />
          )}

          {trustDeviceEnabled && (
            <Checkbox
              isDisabled={isPending}
              isSelected={trustDevice}
              name="trustDevice"
              variant={variant === "transparent" ? "primary" : "secondary"}
              onChange={setTrustDevice}
            >
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>

                {twoFactorLocalization.trustDevice}
              </Checkbox.Content>
            </Checkbox>
          )}

          <div className="flex flex-col gap-3">
            {needsOtpRequest ? (
              <Button
                className="w-full"
                isPending={isSendingOtp}
                onPress={() => sendTwoFactorOtp()}
              >
                {isSendingOtp && <Spinner color="current" size="sm" />}

                {twoFactorLocalization.sendEmailCode}
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full"
                isDisabled={method !== "backup" && code.length !== codeLength}
                isPending={isPending}
              >
                {isPending && <Spinner color="current" size="sm" />}

                {twoFactorLocalization.verify}
              </Button>
            )}

            {method === "otp" && otpRequested && (
              <Button
                className="w-full"
                variant="tertiary"
                isDisabled={isPending || isCoolingDown}
                onPress={() => sendTwoFactorOtp()}
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
                className="w-full"
                isDisabled={isPending}
                key={alternative.key}
                variant="ghost"
                onPress={() => switchMethod(alternative.key)}
              >
                {alternative.label}
              </Button>
            ))}
          </div>
        </Form>
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        <Description className="text-sm">
          <Link
            href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
            className="text-accent no-underline hover:underline decoration-accent-hover"
          >
            {twoFactorLocalization.backToSignIn}
          </Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
