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
import { Input } from "@/components/ui/input"
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
  const [code, setCode] = createSignal("")
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
    onError: () => setCode(""),
    onSuccess: onVerified
  }))

  const verifyOtp = createMutation(() => ({
    ...verifyTwoFactorOtpOptions(twoFactorClient()),
    onError: () => setCode(""),
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

  const verifyCode = (completedCode: string) => {
    if (
      isPending() ||
      needsOtpRequest() ||
      method() === "backup" ||
      completedCode.length !== codeLength
    ) {
      return
    }

    const trust = trustDeviceEnabled ? { trustDevice: trustDevice() } : {}

    if (method() === "otp") {
      verifyOtp.mutate({ code: completedCode, ...trust } as Parameters<
        typeof verifyOtp.mutate
      >[0])
      return
    }

    verifyTotp.mutate({ code: completedCode, ...trust } as Parameters<
      typeof verifyTotp.mutate
    >[0])
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

  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()

    const trust = trustDeviceEnabled ? { trustDevice: trustDevice() } : {}

    if (method() === "backup") {
      const formData = new FormData(event.currentTarget)
      verifyBackupCode.mutate({
        code: String(formData.get("backupCode") ?? "").trim(),
        ...trust
      } as Parameters<typeof verifyBackupCode.mutate>[0])
      return
    }

    verifyCode(code())
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
        <form aria-label={twoFactorLocalization.twoFactor} onSubmit={submit}>
          <FieldGroup>
            <Show
              when={method() === "backup"}
              fallback={
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
                  name="code"
                  onInput={setCode}
                  onComplete={verifyCode}
                  value={code()}
                />
              }
            >
              <Field>
                <FieldLabel for="two-factor-backup-code">
                  {twoFactorLocalization.backupCode}
                </FieldLabel>
                <Input
                  autocomplete="one-time-code"
                  autofocus
                  disabled={isPending()}
                  id="two-factor-backup-code"
                  name="backupCode"
                  required
                />
              </Field>
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
                  onClick={() =>
                    sendOtp.mutate({} as Parameters<typeof sendOtp.mutate>[0])
                  }
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
                  onClick={() =>
                    sendOtp.mutate({} as Parameters<typeof sendOtp.mutate>[0])
                  }
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
                    onClick={() => {
                      setCode("")
                      setMethod(alternative.key)
                    }}
                    type="button"
                    variant="ghost"
                  >
                    {alternative.label}
                  </Button>
                )}
              </For>
            </div>
          </FieldGroup>
        </form>
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
