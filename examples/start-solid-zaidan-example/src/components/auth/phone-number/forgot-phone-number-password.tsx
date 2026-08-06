import type { PhoneNumberAuthClient } from "@better-auth-ui/core/plugins/phone-number"
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
import {
  Field,
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
  class?: string
}

/** Request the code used to reset a phone credential password. */
export function ForgotPhoneNumberPassword(
  props: ForgotPhoneNumberPasswordProps
) {
  const auth = useAuth()
  const { localization, viewPaths: phoneNumberViewPaths } =
    useAuthPlugin(phoneNumberPlugin)
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
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
    const formData = new FormData(event.currentTarget)
    requestReset.mutate({
      phoneNumber: String(formData.get("phoneNumber") ?? ""),
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
            <Field data-invalid={Boolean(fieldError())}>
              <FieldLabel for="forgot-phone-number">
                {localization.phoneNumber}
              </FieldLabel>
              <Input
                aria-invalid={Boolean(fieldError())}
                autocomplete="tel"
                disabled={requestReset.isPending}
                id="forgot-phone-number"
                inputmode="tel"
                name="phoneNumber"
                onInput={() => setFieldError(undefined)}
                onInvalid={(event) => {
                  event.preventDefault()
                  setFieldError(event.currentTarget.validationMessage)
                }}
                placeholder={localization.phoneNumberPlaceholder}
                required
                type="tel"
              />
              <Show when={fieldError()}>
                {(message) => <FieldError>{message()}</FieldError>}
              </Show>
            </Field>
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
