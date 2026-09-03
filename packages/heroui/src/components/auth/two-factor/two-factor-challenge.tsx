import { authQueryKeys, validateStringLength } from "@better-auth-ui/core"
import {
  clearTwoFactorMethods,
  readTwoFactorMethods,
  type TwoFactorAuthClient,
  type TwoFactorMethod
} from "@better-auth-ui/core/plugins/two-factor"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useSendTwoFactorOtp,
  useVerifyBackupCode,
  useVerifyTotp,
  useVerifyTwoFactorOtp
} from "@better-auth-ui/react/plugins/two-factor"
import {
  Button,
  Card,
  type CardProps,
  Checkbox,
  cn,
  Description,
  Input,
  Label,
  Link,
  Spinner,
  TextField,
  useIsHydrated
} from "@heroui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { twoFactorPlugin } from "../../../lib/auth/two-factor-plugin"
import {
  RESEND_COOLDOWN_SECONDS,
  useResendCooldown
} from "../../../lib/auth/use-resend-cooldown"
import {
  clearAuthFormServerError,
  isAuthFormFieldInvalid,
  setAuthFormServerError,
  submitAuthForm,
  useAuthForm
} from "../auth-form"
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
  const session = useSession(authClient)
  const queryClient = useQueryClient()
  const isHydrated = useIsHydrated()

  const [methods, setMethods] = useState<TwoFactorMethod[]>(() =>
    isHydrated ? readTwoFactorMethods() : ["totp", "otp"]
  )
  const [method, setMethod] = useState<ChallengeMethod>(
    () => methods[0] ?? "totp"
  )
  const [otpRequested, setOtpRequested] = useState(false)
  const { cooldown, isCoolingDown, startCooldown } = useResendCooldown()

  useEffect(() => {
    const stored = readTwoFactorMethods()
    setMethods(stored)
    setMethod(stored[0] ?? "totp")
  }, [])

  const onVerified = async () => {
    clearTwoFactorMethods()
    await queryClient.invalidateQueries({
      queryKey: authQueryKeys.listSessions(session.data?.user.id)
    })
    navigate({ to: redirectTo })
  }

  const { mutateAsync: sendTwoFactorOtp, isPending: isSendingOtp } =
    useSendTwoFactorOtp(twoFactorClient, {
      onSuccess: () => {
        setOtpRequested(true)
        startCooldown(RESEND_COOLDOWN_SECONDS)
      }
    })

  const { mutateAsync: verifyTotp, isPending: isVerifyingTotp } = useVerifyTotp(
    twoFactorClient,
    { onError: () => form.setFieldValue("code", ""), onSuccess: onVerified }
  )

  const { mutateAsync: verifyTwoFactorOtp, isPending: isVerifyingOtp } =
    useVerifyTwoFactorOtp(twoFactorClient, {
      onError: () => form.setFieldValue("code", ""),
      onSuccess: onVerified
    })

  const { mutateAsync: verifyBackupCode, isPending: isVerifyingBackupCode } =
    useVerifyBackupCode(twoFactorClient, { onSuccess: onVerified })

  const isPending =
    isSendingOtp || isVerifyingTotp || isVerifyingOtp || isVerifyingBackupCode
  const needsOtpRequest = method === "otp" && !otpRequested

  const form = useAuthForm({
    defaultValues: { backupCode: "", code: "", trustDevice: false },
    onSubmit: async ({ value }) => {
      const trust = trustDeviceEnabled ? { trustDevice: value.trustDevice } : {}
      if (method === "backup") {
        await verifyBackupCode({ code: value.backupCode.trim(), ...trust })
        return
      }

      await verifyCode(value.code)
    }
  })

  const switchMethod = (next: ChallengeMethod) => {
    clearAuthFormServerError(form)
    form.setFieldValue("code", "")
    form.setFieldValue("backupCode", "")
    setMethod(next)
  }

  const verifyCode = async (completedCode: string) => {
    if (
      isPending ||
      needsOtpRequest ||
      method === "backup" ||
      completedCode.length !== codeLength
    ) {
      return
    }

    const trust = trustDeviceEnabled
      ? { trustDevice: form.state.values.trustDevice }
      : {}

    if (method === "otp") {
      await verifyTwoFactorOtp({ code: completedCode, ...trust })
      return
    }

    await verifyTotp({ code: completedCode, ...trust })
  }

  const requestOtp = async () => {
    try {
      await sendTwoFactorOtp()
    } catch (error) {
      setAuthFormServerError(form, error, twoFactorLocalization.sendEmailCode)
    }
  }

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
        <form.AppForm>
          <form.AuthFormRoot className="flex flex-col gap-4">
            {method === "backup" ? (
              <form.AppField
                name="backupCode"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(value, {
                      requiredMessage: localization.auth.fieldRequired,
                      trim: true
                    })
                }}
              >
                {(field) => (
                  <TextField
                    isInvalid={isAuthFormFieldInvalid(field.state.meta)}
                    name={field.name}
                    autoComplete="one-time-code"
                    isDisabled={isPending}
                    validationBehavior="aria"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                  >
                    <Label>{twoFactorLocalization.backupCode}</Label>
                    <Input
                      autoFocus
                      variant={
                        variant === "transparent" ? "primary" : "secondary"
                      }
                    />
                    <field.AuthFormFieldError />
                  </TextField>
                )}
              </form.AppField>
            ) : (
              <form.AppField name="code">
                {(field) => (
                  <OtpField
                    autoFocus
                    isDisabled={isPending || needsOtpRequest}
                    label={
                      method === "otp"
                        ? twoFactorLocalization.emailedCode
                        : twoFactorLocalization.authenticatorCode
                    }
                    length={codeLength}
                    name={field.name}
                    value={field.state.value}
                    variant={variant}
                    onChange={field.handleChange}
                    onComplete={(code) => {
                      form.setFieldValue("code", code)
                      void submitAuthForm(
                        form,
                        localization.auth.callbackFailedTitle
                      )
                    }}
                  />
                )}
              </form.AppField>
            )}

            {trustDeviceEnabled && (
              <form.AppField name="trustDevice">
                {(field) => (
                  <Checkbox
                    isDisabled={isPending}
                    isSelected={field.state.value}
                    name={field.name}
                    variant={
                      variant === "transparent" ? "primary" : "secondary"
                    }
                    onChange={field.handleChange}
                  >
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>

                      {twoFactorLocalization.trustDevice}
                    </Checkbox.Content>
                  </Checkbox>
                )}
              </form.AppField>
            )}

            <div className="flex flex-col gap-3">
              {needsOtpRequest ? (
                <Button
                  className="w-full"
                  isPending={isSendingOtp}
                  onPress={() => void requestOtp()}
                >
                  {isSendingOtp && <Spinner color="current" size="sm" />}

                  {twoFactorLocalization.sendEmailCode}
                </Button>
              ) : (
                <form.Subscribe selector={(state) => state.values.code}>
                  {(code) => (
                    <form.AuthFormSubmitButton
                      className="w-full"
                      isDisabled={
                        method !== "backup" && code.length !== codeLength
                      }
                    >
                      {isPending && <Spinner color="current" size="sm" />}

                      {twoFactorLocalization.verify}
                    </form.AuthFormSubmitButton>
                  )}
                </form.Subscribe>
              )}

              {method === "otp" && otpRequested && (
                <Button
                  className="w-full"
                  variant="tertiary"
                  isDisabled={isPending || isCoolingDown}
                  onPress={() => void requestOtp()}
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
            <form.AuthFormServerError />
          </form.AuthFormRoot>
        </form.AppForm>
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
