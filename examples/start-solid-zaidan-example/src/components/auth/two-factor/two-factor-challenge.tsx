import { authQueryKeys } from "@better-auth-ui/core"
import {
  sendTwoFactorOtpOptions,
  type TwoFactorAuthClient,
  verifyBackupCodeOptions,
  verifyTotpOptions,
  verifyTwoFactorOtpOptions
} from "@better-auth-ui/core/plugins/two-factor"
import {
  AuthLink,
  useAuth,
  useAuthPlugin,
  useSession
} from "@better-auth-ui/solid"
import { createMutation, useQueryClient } from "@tanstack/solid-query"
import { createSignal, For, Show } from "solid-js"

import { OtpField } from "@/components/auth/otp-field"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import {
  clearTwoFactorMethods,
  readTwoFactorMethods,
  type TwoFactorMethod
} from "@/lib/auth/two-factor-methods"
import { twoFactorPlugin } from "@/lib/auth/two-factor-plugin"
import {
  RESEND_COOLDOWN_SECONDS,
  useResendCooldown
} from "@/lib/auth/use-resend-cooldown"
import { cn } from "@/lib/utils"
import {
  createAuthForm,
  setAuthFormServerError,
  submitAuthForm
} from "../auth-form"

/** Challenge surfaces the view can render, in the order they are offered. */
type ChallengeMethod = TwoFactorMethod | "backup"

export type TwoFactorChallengeProps = {
  class?: string
}

/**
 * Second-factor challenge that finishes a pending sign-in.
 *
 * Better Auth answers a password sign-in with `twoFactorRedirect` instead of
 * a session, and the shared sign-in continuation sends the browser here with
 * the enabled methods in session storage. Verifying is what creates the
 * session, after which the original `redirectTo` is resumed.
 */
export function TwoFactorChallenge(props: TwoFactorChallengeProps) {
  const auth = useAuth()
  const session = useSession(auth.authClient)
  const queryClient = useQueryClient()
  const {
    backupCodes: backupCodesEnabled,
    codeLength,
    localization: twoFactorLocalization,
    trustDevice: trustDeviceEnabled
  } = useAuthPlugin(twoFactorPlugin)

  const storedMethods = readTwoFactorMethods()

  const [methods] = createSignal<TwoFactorMethod[]>(storedMethods)
  const [method, setMethod] = createSignal<ChallengeMethod>(
    storedMethods[0] ?? "totp"
  )
  const [trustDevice, setTrustDevice] = createSignal(false)
  const [otpRequested, setOtpRequested] = createSignal(false)
  const { cooldown, isCoolingDown, startCooldown } = useResendCooldown()

  const twoFactorClient = () => auth.authClient as TwoFactorAuthClient

  const onVerified = async () => {
    clearTwoFactorMethods()
    await queryClient.invalidateQueries({
      queryKey: authQueryKeys.listSessions(session.data?.user.id)
    })
    auth.navigate({ to: auth.redirectTo })
  }

  const sendOtp = createMutation(() => ({
    ...sendTwoFactorOtpOptions(twoFactorClient()),
    onSuccess: () => {
      setOtpRequested(true)
      startCooldown(RESEND_COOLDOWN_SECONDS)
    }
  }))

  const verifyTotp = createMutation(() => ({
    ...verifyTotpOptions(twoFactorClient()),
    onError: () => form.setFieldValue("code", ""),
    onSuccess: onVerified
  }))

  const verifyOtp = createMutation(() => ({
    ...verifyTwoFactorOtpOptions(twoFactorClient()),
    onError: () => form.setFieldValue("code", ""),
    onSuccess: onVerified
  }))

  const verifyBackupCode = createMutation(() => ({
    ...verifyBackupCodeOptions(twoFactorClient()),
    onSuccess: onVerified
  }))

  const isPending = () =>
    sendOtp.isPending ||
    verifyTotp.isPending ||
    verifyOtp.isPending ||
    verifyBackupCode.isPending

  const needsOtpRequest = () => method() === "otp" && !otpRequested()

  const form = createAuthForm(() => ({
    defaultValues: { backupCode: "", code: "" },
    onSubmit: async ({ value }) => {
      const trust = trustDeviceEnabled ? { trustDevice: trustDevice() } : {}
      if (method() === "backup") {
        await verifyBackupCode.mutateAsync({
          code: value.backupCode.trim(),
          ...trust
        } as Parameters<typeof verifyBackupCode.mutateAsync>[0])
        return
      }
      if (method() === "otp") {
        await verifyOtp.mutateAsync({
          code: value.code,
          ...trust
        } as Parameters<typeof verifyOtp.mutateAsync>[0])
        return
      }
      await verifyTotp.mutateAsync({
        code: value.code,
        ...trust
      } as Parameters<typeof verifyTotp.mutateAsync>[0])
    }
  }))
  const code = form.useSelector((state) => state.values.code)

  const verifyCode = async (completedCode: string) => {
    if (
      isPending() ||
      needsOtpRequest() ||
      method() === "backup" ||
      completedCode.length !== codeLength
    ) {
      return
    }

    form.setFieldValue("code", completedCode)
    await submitAuthForm(form)
  }

  const description = () => {
    if (method() === "backup")
      return twoFactorLocalization.backupCodeDescription
    if (method() === "otp") return twoFactorLocalization.emailedCodeDescription

    return twoFactorLocalization.authenticatorCodeDescription
  }

  const alternatives = (): { key: ChallengeMethod; label: string }[] => [
    ...(method() !== "totp" && methods().includes("totp")
      ? [
          {
            key: "totp" as const,
            label: twoFactorLocalization.useAuthenticator
          }
        ]
      : []),
    ...(method() !== "otp" && methods().includes("otp")
      ? [{ key: "otp" as const, label: twoFactorLocalization.useEmailedCode }]
      : []),
    ...(method() !== "backup" && backupCodesEnabled
      ? [{ key: "backup" as const, label: twoFactorLocalization.useBackupCode }]
      : [])
  ]

  const requestOtp = async () => {
    try {
      await sendOtp.mutateAsync({} as Parameters<typeof sendOtp.mutateAsync>[0])
    } catch (error) {
      setAuthFormServerError(form, error, "Unable to send a code. Try again.")
    }
  }

  const switchMethod = (nextMethod: ChallengeMethod) => {
    setMethod(nextMethod)
    form.setFieldValue("code", "")
    form.setFieldValue("backupCode", "")
    form.validateField("code", "change")
    form.validateField("backupCode", "change")
  }

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {twoFactorLocalization.twoFactor}
        </CardTitle>

        <CardDescription>{description()}</CardDescription>
      </CardHeader>

      <CardContent>
        <form.AppForm>
          <form.AuthFormRoot aria-label={twoFactorLocalization.twoFactor}>
            <FieldGroup>
              <Show
                when={method() === "backup"}
                fallback={
                  <form.AppField
                    name="code"
                    validators={{
                      onChange: ({ value }) =>
                        method() === "backup" || value.length === codeLength
                          ? undefined
                          : twoFactorLocalization.codeLengthMismatch.replace(
                              "{{length}}",
                              String(codeLength)
                            )
                    }}
                  >
                    {(field) => (
                      <OtpField
                        autofocus
                        disabled={isPending() || needsOtpRequest()}
                        id="two-factor-code"
                        label={
                          method() === "otp"
                            ? twoFactorLocalization.emailedCode
                            : twoFactorLocalization.authenticatorCode
                        }
                        length={codeLength}
                        name={field().name}
                        onInput={field().handleChange}
                        onComplete={(value) => void verifyCode(value)}
                        value={field().state.value}
                      />
                    )}
                  </form.AppField>
                }
              >
                <form.AppField
                  name="backupCode"
                  validators={{
                    onChange: ({ value }) =>
                      method() !== "backup" || value.trim()
                        ? undefined
                        : auth.localization.auth.fieldRequired
                  }}
                >
                  {(field) => (
                    <field.AuthFormTextField
                      autocomplete="one-time-code"
                      autofocus
                      disabled={isPending()}
                      id="two-factor-backup-code"
                      label={twoFactorLocalization.backupCode}
                    />
                  )}
                </form.AppField>
              </Show>

              <Show when={trustDeviceEnabled}>
                <Field orientation="horizontal">
                  <Checkbox
                    checked={trustDevice()}
                    disabled={isPending()}
                    id="two-factor-trust-device"
                    name="trustDevice"
                    onChange={(event) => setTrustDevice(event)}
                  />
                  <FieldContent>
                    <FieldLabel for="two-factor-trust-device">
                      {twoFactorLocalization.trustDevice}
                    </FieldLabel>
                  </FieldContent>
                </Field>
              </Show>

              <div class="flex flex-col gap-3">
                <Show
                  when={needsOtpRequest()}
                  fallback={
                    <Button
                      class="w-full"
                      disabled={
                        isPending() ||
                        (method() !== "backup" && code().length !== codeLength)
                      }
                      type="submit"
                    >
                      <Show when={isPending()}>
                        <Spinner />
                      </Show>

                      {twoFactorLocalization.verify}
                    </Button>
                  }
                >
                  <Button
                    class="w-full"
                    disabled={sendOtp.isPending}
                    onClick={() => void requestOtp()}
                    type="button"
                  >
                    <Show when={sendOtp.isPending}>
                      <Spinner />
                    </Show>

                    {twoFactorLocalization.sendEmailCode}
                  </Button>
                </Show>

                <Show when={method() === "otp" && otpRequested()}>
                  <Button
                    class="w-full"
                    disabled={isPending() || isCoolingDown()}
                    onClick={() => void requestOtp()}
                    type="button"
                    variant="outline"
                  >
                    {isCoolingDown()
                      ? auth.localization.auth.resendIn.replace(
                          "{{seconds}}",
                          String(cooldown())
                        )
                      : auth.localization.auth.resend}
                  </Button>
                </Show>

                <For each={alternatives()}>
                  {(alternative) => (
                    <Button
                      class="w-full"
                      disabled={isPending()}
                      onClick={() => switchMethod(alternative.key)}
                      type="button"
                      variant="ghost"
                    >
                      {alternative.label}
                    </Button>
                  )}
                </For>
              </div>
              <form.AuthFormServerError />
            </FieldGroup>
          </form.AuthFormRoot>
        </form.AppForm>
      </CardContent>

      <CardFooter class="justify-center">
        <AuthLink
          class="text-sm underline underline-offset-4"
          href={`${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`}
        >
          {twoFactorLocalization.backToSignIn}
        </AuthLink>
      </CardFooter>
    </Card>
  )
}
