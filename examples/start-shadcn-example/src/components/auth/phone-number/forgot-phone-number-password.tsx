"use client"

import { getFormFieldErrorMessage } from "@better-auth-ui/core"
import {
  createPhoneNumberValue,
  type PhoneNumberAuthClient
} from "@better-auth-ui/core/plugins/phone-number"
import { useAuth, useAuthPlugin, useFetchOptions } from "@better-auth-ui/react"
import { useRequestPhoneNumberPasswordReset } from "@better-auth-ui/react/plugins/phone-number"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldDescription, FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { cn } from "@/lib/utils"
import { useAuthForm } from "../auth-form"
import { InternationalPhoneField } from "./international-phone-field"

export const PHONE_NUMBER_RESET_STORAGE_KEY =
  "better-auth-ui.phone-number-reset"

export type ForgotPhoneNumberPasswordProps = {
  className?: string
}

/** Request the verification code used to reset a phone credential password. */
export function ForgotPhoneNumberPassword({
  className
}: ForgotPhoneNumberPasswordProps) {
  const { authClient, basePaths, localization, navigate, plugins, Link } =
    useAuth()
  const {
    adapter,
    countries,
    defaultCountry,
    locale,
    localization: phoneLocalization,
    viewPaths: phoneNumberViewPaths
  } = useAuthPlugin(phoneNumberPlugin)
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const { mutate: requestReset, isPending } =
    useRequestPhoneNumberPasswordReset(authClient as PhoneNumberAuthClient, {
      onError: () => resetFetchOptions(),
      onSuccess: (_data, { phoneNumber }) => {
        sessionStorage.setItem(PHONE_NUMBER_RESET_STORAGE_KEY, phoneNumber)
        navigate({
          to: `${basePaths.auth}/${phoneNumberViewPaths.auth.phoneNumberResetPassword}`
        })
      }
    })
  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent

  const form = useAuthForm({
    defaultValues: {
      phoneNumber: createPhoneNumberValue("", defaultCountry, adapter)
    },
    onSubmit: ({ value }) => {
      if (!value.phoneNumber.e164) return
      requestReset({ phoneNumber: value.phoneNumber.e164, fetchOptions })
    }
  })

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl">
          {phoneLocalization.forgotPassword}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.AuthFormRoot>
            <FieldGroup>
              <form.AppField
                name="phoneNumber"
                validators={{
                  onChange: ({ value }) =>
                    value.e164
                      ? undefined
                      : phoneLocalization.invalidPhoneNumber
                }}
              >
                {(field) => (
                  <InternationalPhoneField
                    adapter={adapter}
                    countryCodes={countries}
                    countryLabel={phoneLocalization.country}
                    disabled={isPending}
                    error={getFormFieldErrorMessage(field.state.meta.errors)}
                    locale={locale}
                    phoneLabel={phoneLocalization.phoneNumber}
                    placeholder={phoneLocalization.phoneNumberPlaceholder}
                    value={field.state.value}
                    onChange={field.handleChange}
                  />
                )}
              </form.AppField>
              {Captcha && <div className="flex justify-center">{Captcha}</div>}
              <form.AuthFormSubmitButton disabled={isPending}>
                {isPending && <Spinner />}
                {phoneLocalization.sendCode}
              </form.AuthFormSubmitButton>
            </FieldGroup>
          </form.AuthFormRoot>
        </form.AppForm>
        <FieldDescription className="mt-4 text-center">
          {localization.auth.rememberYourPassword}{" "}
          <Link
            href={`${basePaths.auth}/${phoneNumberViewPaths.auth.phoneNumber}`}
            className="underline underline-offset-4"
          >
            {localization.auth.signIn}
          </Link>
        </FieldDescription>
      </CardContent>
    </Card>
  )
}
