import {
  createPhoneNumberValue,
  type PhoneNumberAuthClient
} from "@better-auth-ui/core/plugins/phone-number"
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
  Fieldset,
  Form,
  Skeleton,
  Spinner,
  toast
} from "@heroui/react"
import { type SyntheticEvent, useEffect, useState } from "react"

import { phoneNumberPlugin } from "../../../lib/auth/phone-number-plugin"
import { OtpField } from "../otp-field"
import { InternationalPhoneField } from "./international-phone-field"
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
  const {
    adapter,
    countries,
    defaultCountry,
    locale,
    localization,
    otpLength
  } = useAuthPlugin(phoneNumberPlugin)
  const phoneClient = authClient as PhoneNumberAuthClient
  const { data: session } = useSession(phoneClient)
  const currentPhoneNumber =
    (session?.user as PhoneNumberUser | undefined)?.phoneNumber ?? ""
  const [phoneNumber, setPhoneNumber] = useState(() =>
    createPhoneNumberValue("", defaultCountry, adapter)
  )
  const [phoneError, setPhoneError] = useState<string>()
  const [code, setCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)

  useEffect(() => {
    setPhoneNumber(
      createPhoneNumberValue(currentPhoneNumber, defaultCountry, adapter)
    )
  }, [adapter, currentPhoneNumber, defaultCountry])

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
        setPhoneNumber(createPhoneNumberValue("", defaultCountry, adapter))
        toast.success(localization.phoneNumberRemoved)
      }
    }
  )
  const isPending = isSending || isVerifying || isRemoving

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!phoneNumber.e164) {
      setPhoneError(localization.invalidPhoneNumber)
      return
    }
    if (!codeSent) {
      sendOtp({ phoneNumber: phoneNumber.e164 })
      return
    }
    verify({ phoneNumber: phoneNumber.e164, code, updatePhoneNumber: true })
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
                        phoneNumber.display
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
                ) : session ? (
                  <InternationalPhoneField
                    adapter={adapter}
                    countryCodes={countries}
                    countryLabel={localization.country}
                    error={phoneError}
                    isDisabled={isPending}
                    locale={locale}
                    phoneLabel={localization.phoneNumber}
                    placeholder={localization.phoneNumberPlaceholder}
                    value={phoneNumber}
                    variant={
                      variant === "transparent" ? "primary" : "secondary"
                    }
                    onChange={(value) => {
                      setPhoneNumber(value)
                      setPhoneError(undefined)
                    }}
                  />
                ) : (
                  <Skeleton className="h-14 w-full rounded-xl" />
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
                      setPhoneNumber(
                        createPhoneNumberValue(
                          currentPhoneNumber,
                          defaultCountry,
                          adapter
                        )
                      )
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
