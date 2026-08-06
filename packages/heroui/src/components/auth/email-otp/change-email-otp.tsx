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
  FieldError,
  Fieldset,
  Form,
  Input,
  Label,
  Skeleton,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import { type SyntheticEvent, useReducer, useState } from "react"

import { emailOtpPlugin } from "../../../lib/auth/email-otp-plugin"
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
  const [code, setCode] = useState("")

  const resetFlow = () => {
    setCode("")
    dispatch({ type: "restarted" })
  }

  // The step transition is attached per call: the code goes to the current
  // address while the pending change targets the new one, so the address to
  // remember isn't in this mutation's variables.
  const { mutate: sendVerificationOtp, isPending: isSending } =
    useSendVerificationOtp(otpClient)

  const { mutate: requestEmailChangeOtp, isPending: isRequesting } =
    useRequestEmailChangeOtp(otpClient, {
      onError: () => setCode(""),
      onSuccess: (_data, { newEmail }) => {
        setCode("")
        dispatch({ type: "changeRequested", newEmail })
      }
    })

  const { mutate: changeEmailOtp, isPending: isChanging } = useChangeEmailOtp(
    otpClient,
    {
      onError: () => setCode(""),
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

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (state.step === "email") {
      const formData = new FormData(e.currentTarget)
      const newEmail = formData.get("email") as string

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

    submitCode(code)
  }

  const codeTarget =
    state.step === "currentCode" ? currentEmail : state.newEmail

  return (
    <div>
      <h2 className={cn("text-sm font-semibold mb-3")}>
        {localization.settings.changeEmail}
      </h2>

      <Card className={cn("p-4 gap-4", className)} variant={variant} {...props}>
        <Card.Content>
          <Form onSubmit={handleSubmit}>
            <Fieldset className="w-full gap-4">
              <Fieldset.Group>
                {state.step === "email" ? (
                  <TextField
                    key={`${session?.user.id}-${currentEmail}-email`}
                    name="email"
                    type="email"
                    defaultValue={currentEmail}
                    isDisabled={isPending || !session}
                  >
                    <Label>{localization.auth.email}</Label>

                    {session ? (
                      <Input
                        required
                        variant={
                          variant === "transparent" ? "primary" : "secondary"
                        }
                        autoComplete="email"
                        placeholder={localization.auth.emailPlaceholder}
                      />
                    ) : (
                      <Skeleton className="h-10 md:h-9 w-full rounded-xl" />
                    )}

                    <FieldError />
                  </TextField>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-muted text-sm">
                      {emailOtpLocalization.confirmEmailDescription.replace(
                        "{{email}}",
                        codeTarget ?? ""
                      )}
                    </p>

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
                      value={code}
                      variant={variant}
                      onChange={setCode}
                      onComplete={submitCode}
                    />

                    {codeTarget && (
                      <OpenEmailButton email={codeTarget} variant="secondary" />
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

                <Button
                  type="submit"
                  isPending={isPending}
                  isDisabled={
                    !session ||
                    (state.step !== "email" && code.length !== otpLength)
                  }
                  size="sm"
                >
                  {isPending && <Spinner color="current" size="sm" />}

                  {state.step === "email"
                    ? localization.settings.updateEmail
                    : emailOtpLocalization.verifyCode}
                </Button>
              </Fieldset.Actions>
            </Fieldset>
          </Form>
        </Card.Content>
      </Card>
    </div>
  )
}
