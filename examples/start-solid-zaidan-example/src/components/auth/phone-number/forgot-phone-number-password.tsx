import {
  createPhoneNumberValue,
  type PhoneNumberAuthClient
} from "@better-auth-ui/core/plugins/phone-number"
import {
  AuthLink,
  useAuth,
  useAuthPlugin,
  useFetchOptions
} from "@better-auth-ui/solid"
import { useRequestPhoneNumberPasswordReset } from "@better-auth-ui/solid/plugins/phone-number"
import { createSignal, Show } from "solid-js"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { cn } from "@/lib/utils"
import { InternationalPhoneField } from "./international-phone-field"

export const PHONE_NUMBER_RESET_STORAGE_KEY =
  "better-auth-ui.phone-number-reset"

export type ForgotPhoneNumberPasswordProps = {
  class?: string
}

/** Request the code used to reset a phone credential password. */
export function ForgotPhoneNumberPassword(
  props: ForgotPhoneNumberPasswordProps
) {
  const auth = useAuth()
  const {
    adapter,
    countries,
    defaultCountry,
    locale,
    localization,
    viewPaths: phoneNumberViewPaths
  } = useAuthPlugin(phoneNumberPlugin)
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const [phoneNumber, setPhoneNumber] = createSignal(
    createPhoneNumberValue("", defaultCountry, adapter)
  )
  const [fieldError, setFieldError] = createSignal<string>()
  const requestReset = useRequestPhoneNumberPasswordReset(
    auth.authClient as PhoneNumberAuthClient,
    () => ({
      onError: () => resetFetchOptions(),
      onSuccess: (_data, variables) => {
        const phoneNumber = (variables as { phoneNumber: string }).phoneNumber
        sessionStorage.setItem(PHONE_NUMBER_RESET_STORAGE_KEY, phoneNumber)
        auth.navigate({
          to: `${auth.basePaths.auth}/${phoneNumberViewPaths.auth.phoneNumberResetPassword}`
        })
      }
    })
  )
  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()
    if (!phoneNumber().e164) {
      setFieldError(localization.invalidPhoneNumber)
      return
    }
    requestReset.mutate({
      phoneNumber: phoneNumber().e164,
      fetchOptions: fetchOptions()
    } as Parameters<typeof requestReset.mutate>[0])
  }

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {localization.forgotPassword}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form aria-label={localization.forgotPassword} onSubmit={submit}>
          <FieldGroup>
            <InternationalPhoneField
              adapter={adapter}
              countryCodes={countries}
              countryLabel={localization.country}
              disabled={requestReset.isPending}
              error={fieldError()}
              locale={locale}
              phoneLabel={localization.phoneNumber}
              placeholder={localization.phoneNumberPlaceholder}
              value={phoneNumber()}
              onChange={(value) => {
                setPhoneNumber(value)
                setFieldError(undefined)
              }}
            />
            <Button
              class="w-full"
              disabled={requestReset.isPending}
              type="submit"
            >
              <Show when={requestReset.isPending}>
                <Spinner />
              </Show>
              {localization.sendCode}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter class="justify-center">
        <p class="text-sm text-muted-foreground">
          {auth.localization.auth.rememberYourPassword}{" "}
          <AuthLink
            class="underline underline-offset-4"
            href={`${auth.basePaths.auth}/${phoneNumberViewPaths.auth.phoneNumber}`}
          >
            {auth.localization.auth.signIn}
          </AuthLink>
        </p>
      </CardFooter>
    </Card>
  )
}
