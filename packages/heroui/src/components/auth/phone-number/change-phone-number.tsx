import { getFormFieldErrorMessage } from "@better-auth-ui/core"
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
  Skeleton,
  Spinner,
  toast
} from "@heroui/react"
import { useSelector } from "@tanstack/react-form"
import { useEffect, useState } from "react"

import { phoneNumberPlugin } from "../../../lib/auth/phone-number-plugin"
import { useAuthForm } from "../auth-form"
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
  const [codeSent, setCodeSent] = useState(false)

  const { mutateAsync: sendOtp, isPending: isSending } = useSendPhoneNumberOtp(
    phoneClient,
    { onSuccess: () => setCodeSent(true) }
  )
  const { mutateAsync: verify, isPending: isVerifying } = useVerifyPhoneNumber(
    phoneClient,
    {
      onError: () => form.setFieldValue("code", ""),
      onSuccess: () => {
        form.setFieldValue("code", "")
        setCodeSent(false)
        toast.success(localization.phoneNumberUpdated)
      }
    }
  )
  const { mutate: updateUser, isPending: isRemoving } = useUpdateUser(
    phoneClient,
    {
      onSuccess: () => {
        form.setFieldValue(
          "phoneNumber",
          createPhoneNumberValue("", defaultCountry, adapter)
        )
        toast.success(localization.phoneNumberRemoved)
      }
    }
  )
  const isPending = isSending || isVerifying || isRemoving

  const form = useAuthForm({
    defaultValues: {
      code: "",
      phoneNumber: createPhoneNumberValue("", defaultCountry, adapter)
    },
    onSubmit: async ({ value }) => {
      if (!value.phoneNumber.e164) return
      if (!codeSent) {
        await sendOtp({ phoneNumber: value.phoneNumber.e164 })
        return
      }
      await verify({
        phoneNumber: value.phoneNumber.e164,
        code: value.code,
        updatePhoneNumber: true
      })
    }
  })
  const codeComplete = useSelector(
    form.store,
    (formState) => formState.values.code.length === otpLength
  )
  const phoneNumberDisplay = useSelector(
    form.store,
    (formState) => formState.values.phoneNumber.display
  )
  useEffect(() => {
    form.setFieldValue(
      "phoneNumber",
      createPhoneNumberValue(currentPhoneNumber, defaultCountry, adapter)
    )
  }, [adapter, currentPhoneNumber, defaultCountry, form.setFieldValue])
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
          <form.AppForm>
            <form.AuthFormRoot>
              <Fieldset className="w-full gap-4">
                <Fieldset.Group>
                  {codeSent ? (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-muted">
                        {localization.codeSentTo.replace(
                          "{{phoneNumber}}",
                          phoneNumberDisplay
                        )}
                      </p>
                      <form.AppField name="code">
                        {(field) => (
                          <OtpField
                            autoFocus
                            isDisabled={isPending}
                            label={localization.phoneCode}
                            length={otpLength}
                            name={field.name}
                            value={field.state.value}
                            variant={variant}
                            onChange={field.handleChange}
                          />
                        )}
                      </form.AppField>
                    </div>
                  ) : session ? (
                    <form.AppField
                      name="phoneNumber"
                      validators={{
                        onChange: ({ value }) =>
                          value.e164
                            ? undefined
                            : localization.invalidPhoneNumber
                      }}
                    >
                      {(field) => (
                        <InternationalPhoneField
                          adapter={adapter}
                          countryCodes={countries}
                          countryLabel={localization.country}
                          error={getFormFieldErrorMessage(
                            field.state.meta.errors
                          )}
                          isDisabled={isPending}
                          locale={locale}
                          phoneLabel={localization.phoneNumber}
                          placeholder={localization.phoneNumberPlaceholder}
                          value={field.state.value}
                          variant={
                            variant === "transparent" ? "primary" : "secondary"
                          }
                          onChange={field.handleChange}
                        />
                      )}
                    </form.AppField>
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
                        form.setFieldValue("code", "")
                        setCodeSent(false)
                        form.setFieldValue(
                          "phoneNumber",
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
                  <form.AuthFormSubmitButton
                    size="sm"
                    type="submit"
                    isDisabled={
                      !session || isPending || (codeSent && !codeComplete)
                    }
                  >
                    {(isSending || isVerifying) && (
                      <Spinner color="current" size="sm" />
                    )}
                    {codeSent
                      ? localization.verifyCode
                      : localization.updatePhoneNumber}
                  </form.AuthFormSubmitButton>
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
            </form.AuthFormRoot>
          </form.AppForm>
        </Card.Content>
      </Card>
    </div>
  )
}
