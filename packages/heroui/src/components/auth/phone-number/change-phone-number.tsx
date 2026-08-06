import type { PhoneNumberAuthClient } from "@better-auth-ui/core/plugins/phone-number"
import {
  useAuth,
  useAuthPlugin,
  useSession,
  useUpdateUser
} from "@better-auth-ui/react"
import {
  useSendPhoneNumberOtp,
  useVerifyPhoneNumber
} from "@better-auth-ui/react/plugins/phone-number"
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
import { type SyntheticEvent, useEffect, useState } from "react"

import { phoneNumberPlugin } from "../../../lib/auth/phone-number-plugin"
import { OtpField } from "../otp-field"
import { RemovePhoneNumberDialog } from "./remove-phone-number-dialog"

type PhoneNumberUser = {
  phoneNumber?: string | null
}

export type ChangePhoneNumberProps = {
  className?: string
  variant?: CardProps["variant"]
}

/** Add, replace, or remove the authenticated user's verified phone number. */
export function ChangePhoneNumber({
  className,
  variant,
  ...props
}: ChangePhoneNumberProps & Omit<CardProps, "children">) {
  const { authClient } = useAuth()
  const { localization, otpLength } = useAuthPlugin(phoneNumberPlugin)
  const phoneClient = authClient as PhoneNumberAuthClient
  const { data: session } = useSession(phoneClient)
  const currentPhoneNumber =
    (session?.user as PhoneNumberUser | undefined)?.phoneNumber ?? ""
  const [phoneNumber, setPhoneNumber] = useState("")
  const [code, setCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)

  useEffect(() => {
    setPhoneNumber(currentPhoneNumber)
  }, [currentPhoneNumber])

  const { mutate: sendOtp, isPending: isSending } = useSendPhoneNumberOtp(
    phoneClient,
    { onSuccess: () => setCodeSent(true) }
  )
  const { mutate: verify, isPending: isVerifying } = useVerifyPhoneNumber(
    phoneClient,
    {
      onError: () => setCode(""),
      onSuccess: () => {
        setCode("")
        setCodeSent(false)
        toast.success(localization.phoneNumberUpdated)
      }
    }
  )
  const { mutate: updateUser, isPending: isRemoving } = useUpdateUser(
    phoneClient,
    {
      onSuccess: () => {
        setPhoneNumber("")
        toast.success(localization.phoneNumberRemoved)
      }
    }
  )
  const isPending = isSending || isVerifying || isRemoving

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!codeSent) {
      sendOtp({ phoneNumber })
      return
    }
    verify({ phoneNumber, code, updatePhoneNumber: true })
  }
  const removePhoneNumber = () =>
    updateUser({
      phoneNumber: null
    } as Parameters<PhoneNumberAuthClient["updateUser"]>[0])

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold">
        {localization.changePhoneNumber}
      </h2>
      <Card className={cn("gap-4 p-4", className)} variant={variant} {...props}>
        <Card.Content>
          <Form onSubmit={handleSubmit}>
            <Fieldset className="w-full gap-4">
              <Fieldset.Group>
                {codeSent ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-muted">
                      {localization.codeSentTo.replace(
                        "{{phoneNumber}}",
                        phoneNumber
                      )}
                    </p>
                    <OtpField
                      autoFocus
                      isDisabled={isPending}
                      label={localization.phoneCode}
                      length={otpLength}
                      name="otp"
                      value={code}
                      variant={variant}
                      onChange={setCode}
                    />
                  </div>
                ) : (
                  <TextField
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    value={phoneNumber}
                    isDisabled={isPending || !session}
                    onChange={setPhoneNumber}
                  >
                    <Label>{localization.phoneNumber}</Label>
                    {session ? (
                      <Input
                        inputMode="tel"
                        placeholder={localization.phoneNumberPlaceholder}
                        required
                        variant={
                          variant === "transparent" ? "primary" : "secondary"
                        }
                      />
                    ) : (
                      <Skeleton className="h-10 w-full rounded-xl md:h-9" />
                    )}
                    <FieldError />
                  </TextField>
                )}
              </Fieldset.Group>
              <Fieldset.Actions>
                {codeSent && (
                  <Button
                    size="sm"
                    variant="tertiary"
                    isDisabled={isPending}
                    onPress={() => {
                      setCode("")
                      setCodeSent(false)
                      setPhoneNumber(currentPhoneNumber)
                    }}
                  >
                    {localization.cancel}
                  </Button>
                )}
                <Button
                  size="sm"
                  type="submit"
                  isDisabled={
                    !session ||
                    isPending ||
                    (codeSent && code.length !== otpLength)
                  }
                  isPending={isSending || isVerifying}
                >
                  {(isSending || isVerifying) && (
                    <Spinner color="current" size="sm" />
                  )}
                  {codeSent
                    ? localization.verifyCode
                    : localization.updatePhoneNumber}
                </Button>
                {!codeSent && currentPhoneNumber && (
                  <RemovePhoneNumberDialog
                    cancelLabel={localization.cancel}
                    description={localization.removePhoneNumberDescription}
                    isPending={isRemoving}
                    label={localization.removePhoneNumber}
                    title={localization.removePhoneNumberTitle}
                    onConfirm={removePhoneNumber}
                  />
                )}
              </Fieldset.Actions>
            </Fieldset>
          </Form>
        </Card.Content>
      </Card>
    </div>
  )
}
