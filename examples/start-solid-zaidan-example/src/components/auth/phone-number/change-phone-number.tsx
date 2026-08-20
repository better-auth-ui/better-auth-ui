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
import { Spinner } from "@/components/ui/spinner"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { cn } from "@/lib/utils"
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
  const [phoneNumber, setPhoneNumber] = createSignal(
    createPhoneNumberValue("", defaultCountry, adapter)
  )
  const [fieldError, setFieldError] = createSignal<string>()
  const [code, setCode] = createSignal("")
  const [codeSent, setCodeSent] = createSignal(false)

  let initialized = false
  createEffect(() => {
    if (!session.data || initialized) return
    initialized = true
    setPhoneNumber(
      createPhoneNumberValue(currentPhoneNumber(), defaultCountry, adapter)
    )
  })

  const sendOtp = useSendPhoneNumberOtp(phoneClient(), () => ({
    onSuccess: () => setCodeSent(true)
  }))
  const verify = useVerifyPhoneNumber(phoneClient(), () => ({
    onError: () => setCode(""),
    onSuccess: () => {
      setCode("")
      setCodeSent(false)
      toast.success(localization.phoneNumberUpdated)
    }
  }))
  const remove = useUpdateUser(phoneClient(), () => ({
    onSuccess: () => {
      setPhoneNumber(createPhoneNumberValue("", defaultCountry, adapter))
      toast.success(localization.phoneNumberRemoved)
    }
  }))
  const isPending = () =>
    sendOtp.isPending || verify.isPending || remove.isPending
  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()
    if (!phoneNumber().e164) {
      setFieldError(localization.invalidPhoneNumber)
      return
    }
    if (!codeSent()) {
      sendOtp.mutate({ phoneNumber: phoneNumber().e164 } as Parameters<
        typeof sendOtp.mutate
      >[0])
      return
    }
    verify.mutate({
      phoneNumber: phoneNumber().e164,
      code: code(),
      updatePhoneNumber: true
    } as Parameters<typeof verify.mutate>[0])
  }
  const removePhoneNumber = () =>
    remove.mutate({
      phoneNumber: null
    } as Parameters<typeof remove.mutate>[0])

  return (
    <div class={cn(props.class)}>
      <h2 class="mb-3 text-sm font-semibold">
        {localization.changePhoneNumber}
      </h2>
      <form onSubmit={submit}>
        <Card>
          <CardContent class="flex flex-col gap-6">
            <Show
              when={codeSent()}
              fallback={
                <Show
                  when={session.data}
                  fallback={<Skeleton class="h-14 w-full" />}
                >
                  <InternationalPhoneField
                    adapter={adapter}
                    countryCodes={countries}
                    countryLabel={localization.country}
                    disabled={isPending()}
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
                <OtpField
                  autofocus
                  disabled={isPending()}
                  id="settings-phone-code"
                  label={localization.phoneCode}
                  length={otpLength}
                  name="otp"
                  onInput={setCode}
                  value={code()}
                />
              </div>
            </Show>
          </CardContent>
          <CardFooter class="gap-3">
            <Show when={codeSent()}>
              <Button
                disabled={isPending()}
                onClick={() => {
                  setCode("")
                  setCodeSent(false)
                  setPhoneNumber(
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
            <Button
              disabled={
                isPending() ||
                !session.data ||
                (codeSent() && code().length !== otpLength)
              }
              size="sm"
              type="submit"
            >
              <Show when={sendOtp.isPending || verify.isPending}>
                <Spinner />
              </Show>
              {codeSent()
                ? localization.verifyCode
                : localization.updatePhoneNumber}
            </Button>
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
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
