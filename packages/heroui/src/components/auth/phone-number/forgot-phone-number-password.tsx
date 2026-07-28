import {
  type PhoneNumberAuthClient,
  useAuth,
  useAuthPlugin,
  useFetchOptions,
  useRequestPhoneNumberPasswordReset
} from "@better-auth-ui/react"
import {
  Button,
  Card,
  type CardProps,
  cn,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Spinner,
  TextField
} from "@heroui/react"
import type { SyntheticEvent } from "react"

import { phoneNumberPlugin } from "../../../lib/auth/phone-number-plugin"

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
  const { localization: phoneLocalization, viewPaths: phoneNumberViewPaths } =
    useAuthPlugin(phoneNumberPlugin)
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
    const formData = new FormData(event.currentTarget)
    requestReset({
      phoneNumber: String(formData.get("phoneNumber") ?? ""),
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
          <TextField
            name="phoneNumber"
            type="tel"
            autoComplete="tel"
            isDisabled={isPending}
            validate={(value) =>
              value ? undefined : localization.auth.fieldRequired
            }
          >
            <Label>{phoneLocalization.phoneNumber}</Label>
            <Input
              inputMode="tel"
              placeholder={phoneLocalization.phoneNumberPlaceholder}
              required
              variant={variant === "transparent" ? "primary" : "secondary"}
            />
            <FieldError />
          </TextField>
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
