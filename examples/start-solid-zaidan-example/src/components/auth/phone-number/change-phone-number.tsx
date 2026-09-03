import {
  createPhoneNumberValue,
  type PhoneNumberAuthClient
} from "@better-auth-ui/core/plugins/phone-number"
import {
  useAuth,
  useAuthPlugin,
  useSession,
  useUpdateUser
} from "@better-auth-ui/solid"
import {
  useSendPhoneNumberOtp,
  useVerifyPhoneNumber
} from "@better-auth-ui/solid/plugins/phone-number"
import { createEffect, createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"

import { OtpField } from "@/components/auth/otp-field"
import { InternationalPhoneField } from "@/components/auth/phone-number/international-phone-field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { cn } from "@/lib/utils"
import { createAuthForm, isAuthFormFieldInvalid } from "../auth-form"
import { RemovePhoneNumberDialog } from "./remove-phone-number-dialog"

type PhoneNumberUser = {
  phoneNumber?: string | null
}

export type ChangePhoneNumberProps = {
  class?: string
}

/** Add, replace, or remove the authenticated user's verified phone number. */
export function ChangePhoneNumber(props: ChangePhoneNumberProps = {}) {
  const auth = useAuth()
  const {
    adapter,
    countries,
    defaultCountry,
    locale,
    localization,
    otpLength
  } = useAuthPlugin(phoneNumberPlugin)
  const phoneClient = () => auth.authClient as PhoneNumberAuthClient
  const session = useSession(phoneClient())
  const currentPhoneNumber = () =>
    (session.data?.user as PhoneNumberUser | undefined)?.phoneNumber ?? ""
  const [codeSent, setCodeSent] = createSignal(false)

  let initialized = false
  createEffect(() => {
    if (!session.data || initialized) return
    initialized = true
    form.setFieldValue(
      "phoneNumber",
      createPhoneNumberValue(currentPhoneNumber(), defaultCountry, adapter)
    )
  })

  const sendOtp = useSendPhoneNumberOtp(phoneClient(), () => ({
    onSuccess: () => setCodeSent(true)
  }))
  const verify = useVerifyPhoneNumber(phoneClient(), () => ({
    onError: () => form.setFieldValue("code", ""),
    onSuccess: () => {
      form.setFieldValue("code", "")
      setCodeSent(false)
      toast.success(localization.phoneNumberUpdated)
    }
  }))
  const remove = useUpdateUser(phoneClient(), () => ({
    onSuccess: () => {
      form.setFieldValue(
        "phoneNumber",
        createPhoneNumberValue("", defaultCountry, adapter)
      )
      toast.success(localization.phoneNumberRemoved)
    }
  }))
  const isPending = () =>
    sendOtp.isPending || verify.isPending || remove.isPending
  const form = createAuthForm(() => ({
    defaultValues: {
      code: "",
      phoneNumber: createPhoneNumberValue("", defaultCountry, adapter)
    },
    onSubmit: async ({ value }) => {
      if (!codeSent()) {
        await sendOtp.mutateAsync({
          phoneNumber: value.phoneNumber.e164
        } as Parameters<typeof sendOtp.mutateAsync>[0])
        return
      }
      await verify.mutateAsync({
        phoneNumber: value.phoneNumber.e164,
        code: value.code,
        updatePhoneNumber: true
      } as Parameters<typeof verify.mutateAsync>[0])
    }
  }))
  const phoneNumber = form.useSelector((state) => state.values.phoneNumber)
  const code = form.useSelector((state) => state.values.code)
  const removePhoneNumber = () =>
    remove.mutate({
      phoneNumber: null
    } as Parameters<typeof remove.mutate>[0])

  return (
    <div class={cn(props.class)}>
      <h2 class="mb-3 text-sm font-semibold">
        {localization.changePhoneNumber}
      </h2>
      <form.AppForm>
        <form.AuthFormRoot>
          <Card>
            <CardContent class="flex flex-col gap-6">
              <Show
                when={codeSent()}
                fallback={
                  <Show
                    when={session.data}
                    fallback={<Skeleton class="h-14 w-full" />}
                  >
                    <form.AppField
                      name="phoneNumber"
                      validators={{
                        onChange: ({ value }) =>
                          value.e164
                            ? undefined
                            : localization.invalidPhoneNumber
                      }}
                    >
                      {(field) => (
                        <InternationalPhoneField
                          adapter={adapter}
                          countryCodes={countries}
                          countryLabel={localization.country}
                          disabled={isPending()}
                          error={
                            isAuthFormFieldInvalid(field().state.meta)
                              ? field().state.meta.errors[0]?.toString()
                              : undefined
                          }
                          locale={locale}
                          onChange={field().handleChange}
                          phoneLabel={localization.phoneNumber}
                          placeholder={localization.phoneNumberPlaceholder}
                          value={field().state.value}
                        />
                      )}
                    </form.AppField>
                  </Show>
                }
              >
                <div class="flex flex-col gap-3">
                  <p class="text-sm text-muted-foreground">
                    {localization.codeSentTo.replace(
                      "{{phoneNumber}}",
                      phoneNumber().display
                    )}
                  </p>
                  <form.AppField
                    name="code"
                    validators={{
                      onChange: ({ value }) =>
                        value.length === otpLength
                          ? undefined
                          : localization.codeLengthMismatch.replace(
                              "{{length}}",
                              String(otpLength)
                            )
                    }}
                  >
                    {(field) => (
                      <OtpField
                        autofocus
                        disabled={isPending()}
                        id="settings-phone-code"
                        label={localization.phoneCode}
                        length={otpLength}
                        name={field().name}
                        onInput={field().handleChange}
                        value={field().state.value}
                      />
                    )}
                  </form.AppField>
                </div>
              </Show>
            </CardContent>
            <CardFooter class="gap-3">
              <Show when={codeSent()}>
                <Button
                  disabled={isPending()}
                  onClick={() => {
                    form.setFieldValue("code", "")
                    setCodeSent(false)
                    form.setFieldValue(
                      "phoneNumber",
                      createPhoneNumberValue(
                        currentPhoneNumber(),
                        defaultCountry,
                        adapter
                      )
                    )
                  }}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {localization.cancel}
                </Button>
              </Show>
              <form.AuthFormSubmitButton
                disabled={
                  isPending() ||
                  !session.data ||
                  (codeSent() && code().length !== otpLength)
                }
                size="sm"
              >
                {codeSent()
                  ? localization.verifyCode
                  : localization.updatePhoneNumber}
              </form.AuthFormSubmitButton>
              <Show when={!codeSent() && currentPhoneNumber()}>
                <RemovePhoneNumberDialog
                  cancelLabel={localization.cancel}
                  description={localization.removePhoneNumberDescription}
                  isPending={remove.isPending}
                  label={localization.removePhoneNumber}
                  title={localization.removePhoneNumberTitle}
                  onConfirm={removePhoneNumber}
                />
              </Show>
              <form.AuthFormServerError />
            </CardFooter>
          </Card>
        </form.AuthFormRoot>
      </form.AppForm>
    </div>
  )
}
