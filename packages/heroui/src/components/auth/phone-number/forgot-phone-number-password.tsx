import { getFormFieldErrorMessage } from "@better-auth-ui/core"
import {
  createPhoneNumberValue,
  type PhoneNumberAuthClient
} from "@better-auth-ui/core/plugins/phone-number"
import { useAuth, useAuthPlugin, useFetchOptions } from "@better-auth-ui/react"
import { useRequestPhoneNumberPasswordReset } from "@better-auth-ui/react/plugins/phone-number"
import { Card, type CardProps, cn, Description, Link } from "@heroui/react"

import { phoneNumberPlugin } from "../../../lib/auth/phone-number-plugin"
import { useAuthForm } from "../auth-form"
import { InternationalPhoneField } from "./international-phone-field"

export const PHONE_NUMBER_RESET_STORAGE_KEY =
  "better-auth-ui.phone-number-reset"

export type ForgotPhoneNumberPasswordProps = {
  className?: string
  variant?: CardProps["variant"]
}

/** Request the verification code used to reset a phone credential password. */
export function ForgotPhoneNumberPassword({
  className,
  variant
}: ForgotPhoneNumberPasswordProps) {
  const { authClient, basePaths, localization, navigate, plugins } = useAuth()
  const {
    adapter,
    countries,
    defaultCountry,
    locale,
    localization: phoneLocalization,
    viewPaths: phoneNumberViewPaths
  } = useAuthPlugin(phoneNumberPlugin)
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const { mutateAsync: requestReset, isPending } =
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
    onSubmit: async ({ value }) => {
      if (!value.phoneNumber.e164) return
      await requestReset({
        phoneNumber: value.phoneNumber.e164,
        fetchOptions
      })
    }
  })

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <Card.Header>
        <Card.Title className="mb-1 text-xl font-semibold">
          {phoneLocalization.forgotPassword}
        </Card.Title>
      </Card.Header>
      <Card.Content className="gap-4">
        <form.AppForm>
          <form.AuthFormRoot className="flex flex-col gap-4">
            <form.AppField
              name="phoneNumber"
              validators={{
                onChange: ({ value }) =>
                  value.e164 ? undefined : phoneLocalization.invalidPhoneNumber
              }}
            >
              {(field) => (
                <InternationalPhoneField
                  adapter={adapter}
                  countryCodes={countries}
                  countryLabel={phoneLocalization.country}
                  error={getFormFieldErrorMessage(field.state.meta.errors)}
                  isDisabled={isPending}
                  locale={locale}
                  phoneLabel={phoneLocalization.phoneNumber}
                  placeholder={phoneLocalization.phoneNumberPlaceholder}
                  value={field.state.value}
                  variant={variant === "transparent" ? "primary" : "secondary"}
                  onChange={field.handleChange}
                />
              )}
            </form.AppField>
            {Captcha && <div className="flex justify-center">{Captcha}</div>}
            <form.AuthFormSubmitButton
              isPending={isPending}
              className="w-full"
              isDisabled={isPending}
            >
              {phoneLocalization.sendCode}
            </form.AuthFormSubmitButton>
          </form.AuthFormRoot>
        </form.AppForm>
      </Card.Content>
      <Card.Footer className="flex-col gap-3">
        <Description className="text-sm">
          {localization.auth.rememberYourPassword}{" "}
          <Link
            className="text-accent no-underline decoration-accent-hover hover:underline"
            href={`${basePaths.auth}/${phoneNumberViewPaths.auth.phoneNumber}`}
          >
            {localization.auth.signIn}
          </Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
