import { validateEmailAddress } from "@better-auth-ui/core"
import type { EmailOtpAuthClient } from "@better-auth-ui/core/plugins/email-otp"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useChangeEmailOtp,
  useRequestEmailChangeOtp,
  useSendVerificationOtp
} from "@better-auth-ui/react/plugins/email-otp"
import {
  Button,
  Card,
  type CardProps,
  cn,
  Fieldset,
  Input,
  Label,
  Skeleton,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import { useSelector } from "@tanstack/react-form"
import { useReducer } from "react"

import { emailOtpPlugin } from "../../../lib/auth/email-otp-plugin"
import {
  isAuthFormFieldInvalid,
  submitAuthForm,
  useAuthForm
} from "../auth-form"
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
  variant?: CardProps["variant"]
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
 * @param variant - Card variant.
 */
export function ChangeEmailOtp({
  className,
  variant,
  ...props
}: ChangeEmailOtpProps & Omit<CardProps, "children">) {
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
  const resetFlow = () => {
    form.reset()
    if (currentEmail) form.setFieldValue("email", currentEmail)
    dispatch({ type: "restarted" })
  }

  // The step transition is attached per call: the code goes to the current
  // address while the pending change targets the new one, so the address to
  // remember isn't in this mutation's variables.
  const { mutateAsync: sendVerificationOtp, isPending: isSending } =
    useSendVerificationOtp(otpClient)

  const { mutateAsync: requestEmailChangeOtp, isPending: isRequesting } =
    useRequestEmailChangeOtp(otpClient, {
      onError: () => form.setFieldValue("code", ""),
      onSuccess: (_data, { newEmail }) => {
        form.setFieldValue("code", "")
        dispatch({ type: "changeRequested", newEmail })
      }
    })

  const { mutateAsync: changeEmailOtp, isPending: isChanging } =
    useChangeEmailOtp(otpClient, {
      onError: () => form.setFieldValue("code", ""),
      onSuccess: () => {
        toast.success(localization.settings.changeEmailSuccess)
        resetFlow()
      }
    })

  const isPending = isSending || isRequesting || isChanging

  const submitCode = async (completedCode: string) => {
    if (isPending || state.step === "email") return

    if (state.step === "currentCode") {
      await requestEmailChangeOtp({
        newEmail: state.newEmail,
        otp: completedCode
      })
      return
    }

    await changeEmailOtp({ newEmail: state.newEmail, otp: completedCode })
  }

  const form = useAuthForm({
    defaultValues: { code: "", email: currentEmail ?? "" },
    onSubmit: async ({ value }) => {
      if (state.step === "email") {
        const newEmail = value.email

        if (verifyCurrentEmail && currentEmail) {
          await sendVerificationOtp(
            { email: currentEmail, type: "change-email" },
            {
              onSuccess: () =>
                dispatch({ type: "currentEmailChallenged", newEmail })
            }
          )
          return
        }

        await requestEmailChangeOtp({ newEmail })
        return
      }

      await submitCode(value.code)
    }
  })
  const codeComplete = useSelector(
    form.store,
    (formState) => formState.values.code.length === otpLength
  )

  const codeTarget =
    state.step === "currentCode" ? currentEmail : state.newEmail

  return (
    <div>
      <h2 className={cn("text-sm font-semibold mb-3")}>
        {localization.settings.changeEmail}
      </h2>

      <Card className={cn("p-4 gap-4", className)} variant={variant} {...props}>
        <Card.Content>
          <form.AppForm>
            <form.AuthFormRoot>
              <Fieldset className="w-full gap-4">
                <Fieldset.Group>
                  {state.step === "email" ? (
                    <form.AppField
                      key={`${session?.user.id}-${currentEmail}-email`}
                      name="email"
                      validators={{
                        onChange: ({ value }) =>
                          validateEmailAddress(value, {
                            invalidMessage: localization.auth.invalidEmail,
                            requiredMessage: localization.auth.fieldRequired
                          })
                      }}
                    >
                      {(field) => (
                        <TextField
                          type="email"
                          isDisabled={isPending || !session}
                          isInvalid={isAuthFormFieldInvalid(field.state.meta)}
                          name={field.name}
                          validationBehavior="aria"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={field.handleChange}
                        >
                          <Label>{localization.auth.email}</Label>

                          {session ? (
                            <Input
                              variant={
                                variant === "transparent"
                                  ? "primary"
                                  : "secondary"
                              }
                              autoComplete="email"
                              placeholder={localization.auth.emailPlaceholder}
                            />
                          ) : (
                            <Skeleton className="h-10 md:h-9 w-full rounded-xl" />
                          )}

                          <field.AuthFormFieldError />
                        </TextField>
                      )}
                    </form.AppField>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-muted text-sm">
                        {emailOtpLocalization.confirmEmailDescription.replace(
                          "{{email}}",
                          codeTarget ?? ""
                        )}
                      </p>

                      <form.AppField name="code">
                        {(field) => (
                          <OtpField
                            autoFocus
                            isDisabled={isPending}
                            label={
                              state.step === "currentCode"
                                ? emailOtpLocalization.confirmCurrentEmail
                                : emailOtpLocalization.confirmNewEmail
                            }
                            length={otpLength}
                            name="otp"
                            value={field.state.value}
                            variant={variant}
                            onChange={field.handleChange}
                            onComplete={() => void submitAuthForm(form)}
                          />
                        )}
                      </form.AppField>

                      {codeTarget && (
                        <OpenEmailButton
                          email={codeTarget}
                          variant="secondary"
                        />
                      )}
                    </div>
                  )}
                </Fieldset.Group>

                <Fieldset.Actions>
                  {state.step !== "email" && (
                    <Button
                      variant="tertiary"
                      size="sm"
                      isDisabled={isPending}
                      onPress={resetFlow}
                    >
                      {localization.settings.cancel}
                    </Button>
                  )}

                  <form.AuthFormSubmitButton
                    isPending={isPending}
                    isDisabled={
                      !session || (state.step !== "email" && !codeComplete)
                    }
                    size="sm"
                  >
                    {isPending && <Spinner color="current" size="sm" />}

                    {state.step === "email"
                      ? localization.settings.updateEmail
                      : emailOtpLocalization.verifyCode}
                  </form.AuthFormSubmitButton>
                </Fieldset.Actions>
              </Fieldset>
              <form.AuthFormServerError />
            </form.AuthFormRoot>
          </form.AppForm>
        </Card.Content>
      </Card>
    </div>
  )
}
