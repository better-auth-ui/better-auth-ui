"use client"

import {
  type PhoneNumberAuthClient,
  useAuth,
  useAuthPlugin,
  useFetchOptions,
  useRequestPhoneNumberPasswordReset
} from "@better-auth-ui/react"
import { type SyntheticEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { cn } from "@/lib/utils"

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
  const { localization: phoneLocalization, viewPaths: phoneNumberViewPaths } =
    useAuthPlugin(phoneNumberPlugin)
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
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
    const formData = new FormData(event.currentTarget)
    requestReset({
      phoneNumber: String(formData.get("phoneNumber") ?? ""),
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
            <Field data-invalid={Boolean(fieldError)}>
              <FieldLabel htmlFor="resetPhoneNumber">
                {phoneLocalization.phoneNumber}
              </FieldLabel>
              <Input
                id="resetPhoneNumber"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder={phoneLocalization.phoneNumberPlaceholder}
                required
                disabled={isPending}
                onChange={() => setFieldError(undefined)}
                onInvalid={(event) => {
                  event.preventDefault()
                  setFieldError(event.currentTarget.validationMessage)
                }}
                aria-invalid={Boolean(fieldError)}
              />
              <FieldError>{fieldError}</FieldError>
            </Field>
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
