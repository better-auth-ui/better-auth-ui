import {
  changeEmailOtpOptions,
  type EmailOtpAuthClient,
  requestEmailChangeOtpOptions,
  sendVerificationOtpOptions,
  useAuth,
  useAuthPlugin,
  useSession
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"

import { OtpField } from "@/components/auth/otp-field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { emailOtpPlugin } from "@/lib/auth/email-otp-plugin"
import { cn } from "@/lib/utils"

type ChangeEmailStep = "email" | "currentCode" | "newCode"

export type ChangeEmailOtpProps = {
  class?: string
}

/**
 * Change the account email with codes instead of a confirmation link.
 *
 * Replaces the built-in `<ChangeEmail />` card when the email-OTP plugin runs
 * with `changeEmail: true`. With `verifyCurrentEmail` on it is a three-step
 * flow — confirm the current address, then the new one — and two steps
 * otherwise.
 */
export function ChangeEmailOtp(props: ChangeEmailOtpProps = {}) {
  const auth = useAuth()
  const {
    localization: emailOtpLocalization,
    otpLength,
    verifyCurrentEmail
  } = useAuthPlugin(emailOtpPlugin)

  const otpClient = () => auth.authClient as EmailOtpAuthClient
  const session = useSession(otpClient())
  const currentEmail = () => session.data?.user.email

  const [step, setStep] = createSignal<ChangeEmailStep>("email")
  const [newEmail, setNewEmail] = createSignal("")
  const [code, setCode] = createSignal("")

  const resetFlow = () => {
    setCode("")
    setNewEmail("")
    setStep("email")
  }

  // The step transition is attached per call: the code goes to the current
  // address while the pending change targets the new one, so the address to
  // remember isn't in this mutation's variables.
  const sendCode = createMutation(() => ({
    ...sendVerificationOtpOptions(otpClient())
  }))

  const requestChange = createMutation(() => ({
    ...requestEmailChangeOtpOptions(otpClient()),
    onError: () => setCode(""),
    onSuccess: () => {
      setCode("")
      setStep("newCode")
    }
  }))

  const changeEmail = createMutation(() => ({
    ...changeEmailOtpOptions(otpClient()),
    onError: () => setCode(""),
    onSuccess: () => {
      toast.success(auth.localization.settings.changeEmailSuccess)
      resetFlow()
    }
  }))

  const isPending = () =>
    sendCode.isPending || requestChange.isPending || changeEmail.isPending

  const codeTarget = () =>
    step() === "currentCode" ? currentEmail() : newEmail()

  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()

    if (step() === "email") {
      const formData = new FormData(event.currentTarget)
      const target = String(formData.get("email") ?? "")
      setNewEmail(target)

      const current = currentEmail()

      if (verifyCurrentEmail && current) {
        sendCode.mutate(
          { email: current, type: "change-email" } as Parameters<
            typeof sendCode.mutate
          >[0],
          { onSuccess: () => setStep("currentCode") }
        )
        return
      }

      requestChange.mutate({ newEmail: target } as Parameters<
        typeof requestChange.mutate
      >[0])
      return
    }

    if (step() === "currentCode") {
      requestChange.mutate({
        newEmail: newEmail(),
        otp: code()
      } as Parameters<typeof requestChange.mutate>[0])
      return
    }

    changeEmail.mutate({ newEmail: newEmail(), otp: code() } as Parameters<
      typeof changeEmail.mutate
    >[0])
  }

  return (
    <div class={cn(props.class)}>
      <h2 class="mb-3 text-sm font-semibold">
        {auth.localization.settings.changeEmail}
      </h2>

      <form onSubmit={submit}>
        <Card>
          <CardContent class="flex flex-col gap-6">
            <Show
              when={step() === "email"}
              fallback={
                <div class="flex flex-col gap-3">
                  <p class="text-muted-foreground text-sm">
                    {emailOtpLocalization.confirmEmailDescription.replace(
                      "{{email}}",
                      codeTarget() ?? ""
                    )}
                  </p>

                  <OtpField
                    autofocus
                    disabled={isPending()}
                    id="change-email-code"
                    label={
                      step() === "currentCode"
                        ? emailOtpLocalization.confirmCurrentEmail
                        : emailOtpLocalization.confirmNewEmail
                    }
                    length={otpLength}
                    name="otp"
                    onInput={setCode}
                    value={code()}
                  />
                </div>
              }
            >
              <div class="grid gap-2">
                <Label for="settings-email">
                  {auth.localization.auth.email}
                </Label>

                <Input
                  autocomplete="email"
                  disabled={isPending() || !session.data}
                  id="settings-email"
                  name="email"
                  placeholder={auth.localization.auth.emailPlaceholder}
                  required
                  type="email"
                  value={currentEmail() ?? ""}
                />
              </div>
            </Show>
          </CardContent>

          <CardFooter class="gap-3">
            <Show when={step() !== "email"}>
              <Button
                disabled={isPending()}
                onClick={resetFlow}
                size="sm"
                type="button"
                variant="outline"
              >
                {auth.localization.settings.cancel}
              </Button>
            </Show>

            <Button
              disabled={
                isPending() ||
                !session.data ||
                (step() !== "email" && code().length !== otpLength)
              }
              size="sm"
              type="submit"
            >
              <Show when={isPending()}>
                <Spinner />
              </Show>

              {step() === "email"
                ? auth.localization.settings.updateEmail
                : emailOtpLocalization.verifyCode}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
