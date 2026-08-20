import { isPasswordCompromisedError } from "@better-auth-ui/core"
import type { PhoneNumberAuthClient } from "@better-auth-ui/core/plugins/phone-number"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useResetPhoneNumberPassword } from "@better-auth-ui/solid/plugins/phone-number"
import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"

import { OtpField } from "@/components/auth/otp-field"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { cn } from "@/lib/utils"
import { PasswordStrengthMeter } from "../password-strength-meter"
import { PHONE_NUMBER_RESET_STORAGE_KEY } from "./forgot-phone-number-password"

export type ResetPhoneNumberPasswordProps = {
  class?: string
}

/** Reset a phone credential password with a verification code. */
export function ResetPhoneNumberPassword(props: ResetPhoneNumberPasswordProps) {
  const auth = useAuth()
  const {
    localization,
    otpLength,
    viewPaths: phoneNumberViewPaths
  } = useAuthPlugin(phoneNumberPlugin)
  const storedPhoneNumber =
    typeof sessionStorage === "undefined"
      ? ""
      : (sessionStorage.getItem(PHONE_NUMBER_RESET_STORAGE_KEY) ?? "")
  const [phoneNumber, setPhoneNumber] = createSignal(storedPhoneNumber)
  const [code, setCode] = createSignal("")
  const [password, setPassword] = createSignal("")
  const [passwordError, setPasswordError] = createSignal<string>()
  const resetPassword = useResetPhoneNumberPassword(
    auth.authClient as PhoneNumberAuthClient,
    () => ({
      onError: (error) => {
        // The haveIBeenPwned plugin rejects on the password itself, so it
        // belongs against the field rather than in a toast.
        if (isPasswordCompromisedError(error)) {
          setPasswordError(auth.localization.auth.passwordCompromised)
        }

        setCode("")
      },
      onSuccess: () => {
        sessionStorage.removeItem(PHONE_NUMBER_RESET_STORAGE_KEY)
        toast.success(auth.localization.auth.passwordResetSuccess)
        auth.navigate({
          to: `${auth.basePaths.auth}/${phoneNumberViewPaths.auth.phoneNumber}`
        })
      }
    })
  )
  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const password = String(formData.get("password") ?? "")
    const confirmPassword = String(formData.get("confirmPassword") ?? "")

    if (
      auth.emailAndPassword?.confirmPassword &&
      password !== confirmPassword
    ) {
      toast.error(auth.localization.auth.passwordsDoNotMatch)
      return
    }
    if (code().length !== otpLength) {
      toast.error(
        localization.codeLengthMismatch.replace("{{length}}", String(otpLength))
      )
      return
    }
    resetPassword.mutate({
      phoneNumber: phoneNumber(),
      otp: code(),
      newPassword: password
    } as Parameters<typeof resetPassword.mutate>[0])
  }

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {localization.resetPassword}
        </CardTitle>
        <Show when={storedPhoneNumber}>
          <CardDescription>
            {localization.codeSentTo.replace("{{phoneNumber}}", phoneNumber())}
          </CardDescription>
        </Show>
      </CardHeader>
      <CardContent>
        <form aria-label={localization.resetPassword} onSubmit={submit}>
          <FieldGroup>
            <Show when={!storedPhoneNumber}>
              <Field>
                <FieldLabel for="reset-phone-number">
                  {localization.phoneNumber}
                </FieldLabel>
                <Input
                  autocomplete="tel"
                  disabled={resetPassword.isPending}
                  id="reset-phone-number"
                  inputmode="tel"
                  name="phoneNumber"
                  onInput={(event) => setPhoneNumber(event.currentTarget.value)}
                  placeholder={localization.phoneNumberPlaceholder}
                  required
                  type="tel"
                  value={phoneNumber()}
                />
              </Field>
            </Show>
            <OtpField
              autofocus={Boolean(storedPhoneNumber)}
              disabled={resetPassword.isPending}
              id="reset-phone-code"
              label={localization.phoneCode}
              length={otpLength}
              name="otp"
              onInput={setCode}
              value={code()}
            />
            <Field data-invalid={Boolean(passwordError())}>
              <FieldLabel for="reset-phone-password">
                {auth.localization.auth.newPassword}
              </FieldLabel>
              <Input
                aria-invalid={Boolean(passwordError())}
                autocomplete="new-password"
                disabled={resetPassword.isPending}
                id="reset-phone-password"
                maxLength={auth.emailAndPassword?.maxPasswordLength}
                minLength={auth.emailAndPassword?.minPasswordLength}
                name="password"
                onInput={(event) => {
                  setPassword(event.currentTarget.value)
                  setPasswordError(undefined)
                }}
                onInvalid={(event) => {
                  event.preventDefault()
                  setPasswordError(event.currentTarget.validationMessage)
                }}
                placeholder={auth.localization.auth.newPasswordPlaceholder}
                required
                type="password"
              />

              <Show when={passwordError()}>
                {(message) => <FieldError>{message()}</FieldError>}
              </Show>

              <PasswordStrengthMeter password={password()} />
            </Field>
            <Show when={auth.emailAndPassword?.confirmPassword}>
              <Field>
                <FieldLabel for="reset-phone-confirm-password">
                  {auth.localization.auth.confirmPassword}
                </FieldLabel>
                <Input
                  autocomplete="new-password"
                  disabled={resetPassword.isPending}
                  id="reset-phone-confirm-password"
                  name="confirmPassword"
                  placeholder={
                    auth.localization.auth.confirmPasswordPlaceholder
                  }
                  required
                  type="password"
                />
              </Field>
            </Show>
            <Button
              class="w-full"
              disabled={resetPassword.isPending || code().length !== otpLength}
              type="submit"
            >
              <Show when={resetPassword.isPending}>
                <Spinner />
              </Show>
              {localization.resetPassword}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
