"use client"

import {
  createPhoneNumberValue,
  type PhoneNumberAuthClient
} from "@better-auth-ui/core/plugins/phone-number"
import { useAuth, useAuthPlugin, useFetchOptions } from "@better-auth-ui/react"
import { useRequestPhoneNumberPasswordReset } from "@better-auth-ui/react/plugins/phone-number"
import { type SyntheticEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldDescription, FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { cn } from "@/lib/utils"
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
  const [phoneNumber, setPhoneNumber] = useState(() =>
    createPhoneNumberValue("", defaultCountry, adapter)
  )
  const [fieldError, setFieldError] = useState<string>()
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

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!phoneNumber.e164) {
      setFieldError(phoneLocalization.invalidPhoneNumber)
      return
    }
    requestReset({
      phoneNumber: phoneNumber.e164,
      fetchOptions
    })
  }

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl">
          {phoneLocalization.forgotPassword}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <InternationalPhoneField
              adapter={adapter}
              countryCodes={countries}
              countryLabel={phoneLocalization.country}
              disabled={isPending}
              error={fieldError}
              locale={locale}
              phoneLabel={phoneLocalization.phoneNumber}
              placeholder={phoneLocalization.phoneNumberPlaceholder}
              value={phoneNumber}
              onChange={(value) => {
                setPhoneNumber(value)
                setFieldError(undefined)
              }}
            />
            {Captcha && <div className="flex justify-center">{Captcha}</div>}
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner />}
              {phoneLocalization.sendCode}
            </Button>
          </FieldGroup>
        </form>
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
