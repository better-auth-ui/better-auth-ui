"use client"

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
import { useSelector } from "@tanstack/react-form"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { FieldDescription } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { cn } from "@/lib/utils"
import { useAuthForm } from "../auth-form"
import { OtpField } from "../otp-field"
import { InternationalPhoneField } from "./international-phone-field"
import { RemovePhoneNumberDialog } from "./remove-phone-number-dialog"

type PhoneNumberUser = {
  phoneNumber?: string | null
}

export type ChangePhoneNumberProps = {
  className?: string
}

/** Add, replace, or remove the authenticated user's verified phone number. */
export function ChangePhoneNumber({ className }: ChangePhoneNumberProps) {
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
    if (session) {
      form.setFieldValue(
        "phoneNumber",
        createPhoneNumberValue(currentPhoneNumber, defaultCountry, adapter)
      )
    }
  }, [adapter, currentPhoneNumber, defaultCountry, form.setFieldValue, session])
  const removePhoneNumber = () =>
    updateUser({
      phoneNumber: null
    } as Parameters<PhoneNumberAuthClient["updateUser"]>[0])

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold">
        {localization.changePhoneNumber}
      </h2>
      <form.AppForm>
        <form.AuthFormRoot>
          <Card className={cn(className)}>
            <CardContent className="flex flex-col gap-6">
              {codeSent ? (
                <>
                  <FieldDescription>
                    {localization.codeSentTo.replace(
                      "{{phoneNumber}}",
                      phoneNumberDisplay
                    )}
                  </FieldDescription>
                  <form.AppField name="code">
                    {(field) => (
                      <OtpField
                        autoFocus
                        disabled={isPending}
                        label={localization.phoneCode}
                        length={otpLength}
                        name="otp"
                        value={field.state.value}
                        onChange={field.handleChange}
                      />
                    )}
                  </form.AppField>
                </>
              ) : session ? (
                <form.AppField
                  name="phoneNumber"
                  validators={{
                    onChange: ({ value }) =>
                      value.e164 ? undefined : localization.invalidPhoneNumber
                  }}
                >
                  {(field) => (
                    <InternationalPhoneField
                      adapter={adapter}
                      countryCodes={countries}
                      countryLabel={localization.country}
                      disabled={isPending}
                      error={getFormFieldErrorMessage(field.state.meta.errors)}
                      locale={locale}
                      phoneLabel={localization.phoneNumber}
                      placeholder={localization.phoneNumberPlaceholder}
                      value={field.state.value}
                      onChange={field.handleChange}
                    />
                  )}
                </form.AppField>
              ) : (
                <Skeleton className="h-14 w-full" />
              )}
            </CardContent>
            <CardFooter className="gap-3">
              {codeSent && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => {
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
                disabled={isPending || !session || (codeSent && !codeComplete)}
              >
                {(isSending || isVerifying) && <Spinner />}
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
            </CardFooter>
          </Card>
        </form.AuthFormRoot>
      </form.AppForm>
    </div>
  )
}
