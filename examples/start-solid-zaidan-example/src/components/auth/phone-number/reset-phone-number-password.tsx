import {
  isPasswordCompromisedError,
  validateStringLength
} from "@better-auth-ui/core"
import type { PhoneNumberAuthClient } from "@better-auth-ui/core/plugins/phone-number"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useResetPhoneNumberPassword } from "@better-auth-ui/solid/plugins/phone-number"
import { Show } from "solid-js"
import { toast } from "solid-sonner"

import { OtpField } from "@/components/auth/otp-field"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { cn } from "@/lib/utils"
import { createAuthForm, setAuthFormServerError } from "../auth-form"
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
  const resetPassword = useResetPhoneNumberPassword(
    auth.authClient as PhoneNumberAuthClient,
    () => ({
      onError: (error) => {
        // The haveIBeenPwned plugin rejects on the password itself, so it
        // belongs against the field rather than in a toast.
        if (isPasswordCompromisedError(error)) {
          setAuthFormServerError(
            form,
            {
              fields: { password: auth.localization.auth.passwordCompromised }
            },
            auth.localization.auth.passwordCompromised
          )
        }

        form.setFieldValue("code", "")
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
  const validatePassword = (value: string) =>
    validateStringLength(value, {
      maxLength: auth.emailAndPassword?.maxPasswordLength,
      maxLengthMessage: auth.localization.auth.tooLong.replace(
        "{{max}}",
        String(auth.emailAndPassword?.maxPasswordLength)
      ),
      minLength: auth.emailAndPassword?.minPasswordLength,
      minLengthMessage: auth.localization.auth.tooShort.replace(
        "{{min}}",
        String(auth.emailAndPassword?.minPasswordLength)
      ),
      requiredMessage: auth.localization.auth.fieldRequired
    })
  const form = createAuthForm(() => ({
    defaultValues: {
      code: "",
      confirmPassword: "",
      password: "",
      phoneNumber: storedPhoneNumber
    },
    onSubmit: async ({ value }) => {
      await resetPassword.mutateAsync({
        phoneNumber: value.phoneNumber,
        otp: value.code,
        newPassword: value.password
      } as Parameters<typeof resetPassword.mutateAsync>[0])
    }
  }))
  const phoneNumber = () => form.state.values.phoneNumber
  const password = () => form.state.values.password
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
        <form.AppForm>
          <form.AuthFormRoot aria-label={localization.resetPassword}>
            <FieldGroup>
              <Show when={!storedPhoneNumber}>
                <form.AppField
                  name="phoneNumber"
                  validators={{
                    onChange: ({ value }) =>
                      value.trim()
                        ? undefined
                        : auth.localization.auth.fieldRequired
                  }}
                >
                  {(field) => (
                    <field.AuthFormTextField
                      autocomplete="tel"
                      disabled={resetPassword.isPending}
                      id="reset-phone-number"
                      inputmode="tel"
                      label={localization.phoneNumber}
                      placeholder={localization.phoneNumberPlaceholder}
                      type="tel"
                    />
                  )}
                </form.AppField>
              </Show>
              <form.AppField
                name="code"
                validators={{
                  onChange: ({ value }) =>
                    value.length === otpLength
                      ? undefined
                      : localization.codeLengthMismatch.replace(
                          "{{length}}",
                          String(otpLength)
                        )
                }}
              >
                {(field) => (
                  <OtpField
                    autofocus={Boolean(storedPhoneNumber)}
                    disabled={resetPassword.isPending}
                    id="reset-phone-code"
                    label={localization.phoneCode}
                    length={otpLength}
                    name={field().name}
                    onInput={field().handleChange}
                    value={field().state.value}
                  />
                )}
              </form.AppField>
              <form.AppField
                name="password"
                validators={{
                  onChange: ({ value }) => validatePassword(value)
                }}
              >
                {(field) => (
                  <>
                    <field.AuthFormTextField
                      autocomplete="new-password"
                      disabled={resetPassword.isPending}
                      id="reset-phone-password"
                      label={auth.localization.auth.newPassword}
                      placeholder={
                        auth.localization.auth.newPasswordPlaceholder
                      }
                      type="password"
                    />
                    <PasswordStrengthMeter password={password()} />
                  </>
                )}
              </form.AppField>
              <Show when={auth.emailAndPassword?.confirmPassword}>
                <form.AppField
                  name="confirmPassword"
                  validators={{
                    onChange: ({ value }) =>
                      value === password()
                        ? undefined
                        : auth.localization.auth.passwordsDoNotMatch
                  }}
                >
                  {(field) => (
                    <field.AuthFormTextField
                      autocomplete="new-password"
                      disabled={resetPassword.isPending}
                      id="reset-phone-confirm-password"
                      label={auth.localization.auth.confirmPassword}
                      placeholder={
                        auth.localization.auth.confirmPasswordPlaceholder
                      }
                      type="password"
                    />
                  )}
                </form.AppField>
              </Show>
              <form.AuthFormSubmitButton
                class="w-full"
                disabled={resetPassword.isPending}
              >
                {localization.resetPassword}
              </form.AuthFormSubmitButton>
              <form.AuthFormServerError />
            </FieldGroup>
          </form.AuthFormRoot>
        </form.AppForm>
      </CardContent>
    </Card>
  )
}
