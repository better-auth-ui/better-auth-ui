"use client"

import type { EmailOtpAuthClient } from "@better-auth-ui/core/plugins/email-otp"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useChangeEmailOtp,
  useRequestEmailChangeOtp,
  useSendVerificationOtp
} from "@better-auth-ui/react/plugins/email-otp"
import { useSelector } from "@tanstack/react-form"
import { useEffect, useReducer } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { emailOtpPlugin } from "@/lib/auth/email-otp-plugin"
import { cn } from "@/lib/utils"
import { useAuthForm } from "../auth-form"
import { OpenEmailButton } from "../open-email-button"
import { OtpField } from "../otp-field"

type ChangeEmailStep = "email" | "currentCode" | "newCode"

type ChangeEmailState = {
  step: ChangeEmailStep
  newEmail: string
}

type ChangeEmailAction =
  | { type: "currentEmailChallenged"; newEmail: string }
  | { type: "changeRequested"; newEmail: string }
  | { type: "restarted" }

const initialChangeEmailState: ChangeEmailState = {
  step: "email",
  newEmail: ""
}

// Every step is reachable from the action alone, so the previous state never
// takes part in the transition.
function changeEmailReducer(
  _state: ChangeEmailState,
  action: ChangeEmailAction
): ChangeEmailState {
  switch (action.type) {
    case "currentEmailChallenged":
      return { step: "currentCode", newEmail: action.newEmail }
    case "changeRequested":
      return { step: "newCode", newEmail: action.newEmail }
    case "restarted":
      return initialChangeEmailState
  }
}

export type ChangeEmailOtpProps = {
  className?: string
}

/**
 * Change the account email with codes instead of a confirmation link.
 *
 * Replaces the built-in `<ChangeEmail />` card when the email-OTP plugin runs
 * with `changeEmail: true`. With `verifyCurrentEmail` on it is a three-step
 * flow — confirm the current address, then the new one — and two steps
 * otherwise.
 *
 * @param className - Additional CSS classes applied to the card.
 */
export function ChangeEmailOtp({ className }: ChangeEmailOtpProps) {
  const { authClient, localization } = useAuth()
  const {
    localization: emailOtpLocalization,
    otpLength,
    verifyCurrentEmail
  } = useAuthPlugin(emailOtpPlugin)

  const otpClient = authClient as EmailOtpAuthClient
  const { data: session } = useSession(otpClient)
  const currentEmail = session?.user.email

  const [state, dispatch] = useReducer(
    changeEmailReducer,
    initialChangeEmailState
  )
  // The step transition is attached per call: the code goes to the current
  // address while the pending change targets the new one, so the address to
  // remember isn't in this mutation's variables.
  const { mutate: sendVerificationOtp, isPending: isSending } =
    useSendVerificationOtp(otpClient)

  const { mutate: requestEmailChangeOtp, isPending: isRequesting } =
    useRequestEmailChangeOtp(otpClient, {
      onError: () => form.setFieldValue("code", ""),
      onSuccess: (_data, { newEmail }) => {
        form.setFieldValue("code", "")
        dispatch({ type: "changeRequested", newEmail })
      }
    })

  const { mutate: changeEmailOtp, isPending: isChanging } = useChangeEmailOtp(
    otpClient,
    {
      onError: () => form.setFieldValue("code", ""),
      onSuccess: () => {
        toast.success(localization.settings.changeEmailSuccess)
        resetFlow()
      }
    }
  )

  const isPending = isSending || isRequesting || isChanging

  const submitCode = (completedCode: string) => {
    if (isPending || state.step === "email") return

    if (state.step === "currentCode") {
      requestEmailChangeOtp({
        newEmail: state.newEmail,
        otp: completedCode
      })
      return
    }

    changeEmailOtp({ newEmail: state.newEmail, otp: completedCode })
  }

  const form = useAuthForm({
    defaultValues: { code: "", email: "" },
    onSubmit: ({ value }) => {
      if (state.step === "email") {
        const newEmail = value.email

        if (verifyCurrentEmail && currentEmail) {
          sendVerificationOtp(
            { email: currentEmail, type: "change-email" },
            {
              onSuccess: () =>
                dispatch({ type: "currentEmailChallenged", newEmail })
            }
          )
          return
        }

        requestEmailChangeOtp({ newEmail })
        return
      }
      submitCode(value.code)
    }
  })
  const codeComplete = useSelector(
    form.store,
    (formState) => formState.values.code.length === otpLength
  )

  const resetFlow = () => {
    form.reset()
    if (currentEmail) form.setFieldValue("email", currentEmail)
    dispatch({ type: "restarted" })
  }

  useEffect(() => {
    if (currentEmail) form.setFieldValue("email", currentEmail)
  }, [currentEmail, form])

  const codeTarget =
    state.step === "currentCode" ? currentEmail : state.newEmail

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">
        {localization.settings.changeEmail}
      </h2>

      <form.AppForm>
        <form.AuthFormRoot>
          <Card className={cn(className)}>
            <CardContent className="flex flex-col gap-6">
              {state.step === "email" ? (
                <form.AppField name="email">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="email">
                        {localization.auth.email}
                      </FieldLabel>

                      {session ? (
                        <Input
                          key={currentEmail}
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={field.state.value}
                          placeholder={localization.auth.emailPlaceholder}
                          disabled={isPending}
                          required
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                        />
                      ) : (
                        <Skeleton>
                          <Input className="invisible" />
                        </Skeleton>
                      )}

                      <field.AuthFormFieldError />
                    </Field>
                  )}
                </form.AppField>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-muted-foreground text-sm">
                    {emailOtpLocalization.confirmEmailDescription.replace(
                      "{{email}}",
                      codeTarget ?? ""
                    )}
                  </p>

                  <form.AppField name="code">
                    {(field) => (
                      <OtpField
                        autoFocus
                        disabled={isPending}
                        label={
                          state.step === "currentCode"
                            ? emailOtpLocalization.confirmCurrentEmail
                            : emailOtpLocalization.confirmNewEmail
                        }
                        length={otpLength}
                        name="otp"
                        value={field.state.value}
                        onChange={field.handleChange}
                        onComplete={submitCode}
                      />
                    )}
                  </form.AppField>

                  {codeTarget && (
                    <OpenEmailButton email={codeTarget} variant="secondary" />
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="gap-3">
              {state.step !== "email" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={resetFlow}
                >
                  {localization.settings.cancel}
                </Button>
              )}

              <form.AuthFormSubmitButton
                size="sm"
                disabled={
                  isPending ||
                  !session ||
                  (state.step !== "email" && !codeComplete)
                }
              >
                {isPending && <Spinner />}

                {state.step === "email"
                  ? localization.settings.updateEmail
                  : emailOtpLocalization.verifyCode}
              </form.AuthFormSubmitButton>
            </CardFooter>
          </Card>
        </form.AuthFormRoot>
      </form.AppForm>
    </div>
  )
}
