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

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { cn } from "@/lib/utils"
import { createAuthForm } from "../auth-form"
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
  const form = createAuthForm(() => ({
    defaultValues: {
      phoneNumber: createPhoneNumberValue("", defaultCountry, adapter)
    },
    onSubmit: async ({ value }) => {
      if (!value.phoneNumber.e164) return
      await requestReset.mutateAsync({
        phoneNumber: value.phoneNumber.e164,
        fetchOptions: fetchOptions()
      } as Parameters<typeof requestReset.mutateAsync>[0])
    }
  }))

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {localization.forgotPassword}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.AuthFormRoot aria-label={localization.forgotPassword}>
            <FieldGroup>
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
                    disabled={requestReset.isPending}
                    error={field().state.meta.errors[0]?.toString()}
                    locale={locale}
                    phoneLabel={localization.phoneNumber}
                    placeholder={localization.phoneNumberPlaceholder}
                    value={field().state.value}
                    onChange={field().handleChange}
                  />
                )}
              </form.AppField>
              <form.AuthFormSubmitButton
                isPending={requestReset.isPending}
                class="w-full"
                disabled={requestReset.isPending}
              >
                {localization.sendCode}
              </form.AuthFormSubmitButton>
              <form.AuthFormServerError />
            </FieldGroup>
          </form.AuthFormRoot>
        </form.AppForm>
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
