import {
  createPhoneNumberValue,
  type PhoneNumberAuthClient
} from "@better-auth-ui/core/plugins/phone-number"
import { useAuth, useAuthPlugin, useFetchOptions } from "@better-auth-ui/react"
import { useRequestPhoneNumberPasswordReset } from "@better-auth-ui/react/plugins/phone-number"
import {
  Button,
  Card,
  type CardProps,
  cn,
  Description,
  Form,
  Link,
  Spinner
} from "@heroui/react"
import { type SyntheticEvent, useState } from "react"

import { phoneNumberPlugin } from "../../../lib/auth/phone-number-plugin"
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
  const [phoneNumber, setPhoneNumber] = useState(() =>
    createPhoneNumberValue("", defaultCountry, adapter)
  )
  const [phoneError, setPhoneError] = useState<string>()
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

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!phoneNumber.e164) {
      setPhoneError(phoneLocalization.invalidPhoneNumber)
      return
    }
    requestReset({
      phoneNumber: phoneNumber.e164,
      fetchOptions
    })
  }

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
        <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <InternationalPhoneField
            adapter={adapter}
            countryCodes={countries}
            countryLabel={phoneLocalization.country}
            error={phoneError}
            isDisabled={isPending}
            locale={locale}
            phoneLabel={phoneLocalization.phoneNumber}
            placeholder={phoneLocalization.phoneNumberPlaceholder}
            value={phoneNumber}
            variant={variant === "transparent" ? "primary" : "secondary"}
            onChange={(value) => {
              setPhoneNumber(value)
              setPhoneError(undefined)
            }}
          />
          {Captcha && <div className="flex justify-center">{Captcha}</div>}
          <Button className="w-full" type="submit" isPending={isPending}>
            {isPending && <Spinner color="current" size="sm" />}
            {phoneLocalization.sendCode}
          </Button>
        </Form>
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
