import {
  type PhoneNumberAuthClient,
  sendPhoneNumberOtpOptions,
  updateUserOptions,
  useAuth,
  useAuthPlugin,
  useSession,
  verifyPhoneNumberOptions
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { createEffect, createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"

import { OtpField } from "@/components/auth/otp-field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
  const { localization, otpLength } = useAuthPlugin(phoneNumberPlugin)
  const phoneClient = () => auth.authClient as PhoneNumberAuthClient
  const session = useSession(phoneClient())
  const currentPhoneNumber = () =>
    (session.data?.user as PhoneNumberUser | undefined)?.phoneNumber ?? ""
  const [phoneNumber, setPhoneNumber] = createSignal("")
  const [fieldError, setFieldError] = createSignal<string>()
  const [code, setCode] = createSignal("")
  const [codeSent, setCodeSent] = createSignal(false)

  let initialized = false
  createEffect(() => {
    if (!session.data || initialized) return
    initialized = true
    setPhoneNumber(currentPhoneNumber())
  })

  const sendOtp = createMutation(() => ({
    ...sendPhoneNumberOtpOptions(phoneClient()),
    onSuccess: () => setCodeSent(true)
  }))
  const verify = createMutation(() => ({
    ...verifyPhoneNumberOptions(phoneClient()),
    onError: () => setCode(""),
    onSuccess: () => {
      setCode("")
      setCodeSent(false)
      toast.success(localization.phoneNumberUpdated)
    }
  }))
  const remove = createMutation(() => ({
    ...updateUserOptions(phoneClient()),
    onSuccess: () => {
      setPhoneNumber("")
      toast.success(localization.phoneNumberRemoved)
    }
  }))
  const isPending = () =>
    sendOtp.isPending || verify.isPending || remove.isPending
  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()
    if (!codeSent()) {
      sendOtp.mutate({ phoneNumber: phoneNumber() } as Parameters<
        typeof sendOtp.mutate
      >[0])
      return
    }
    verify.mutate({
      phoneNumber: phoneNumber(),
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
                <Field data-invalid={Boolean(fieldError())}>
                  <FieldLabel for="settings-phone-number">
                    {localization.phoneNumber}
                  </FieldLabel>
                  <Show
                    when={session.data}
                    fallback={
                      <Skeleton>
                        <Input class="invisible" />
                      </Skeleton>
                    }
                  >
                    <Input
                      aria-invalid={Boolean(fieldError())}
                      autocomplete="tel"
                      disabled={isPending()}
                      id="settings-phone-number"
                      inputmode="tel"
                      name="phoneNumber"
                      onInput={(event) => {
                        setPhoneNumber(event.currentTarget.value)
                        setFieldError(undefined)
                      }}
                      onInvalid={(event) => {
                        event.preventDefault()
                        setFieldError(event.currentTarget.validationMessage)
                      }}
                      placeholder={localization.phoneNumberPlaceholder}
                      required
                      type="tel"
                      value={phoneNumber()}
                    />
                  </Show>
                  <Show when={fieldError()}>
                    {(message) => <FieldError>{message()}</FieldError>}
                  </Show>
                </Field>
              }
            >
              <div class="flex flex-col gap-3">
                <p class="text-sm text-muted-foreground">
                  {localization.codeSentTo.replace(
                    "{{phoneNumber}}",
                    phoneNumber()
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
                  setPhoneNumber(currentPhoneNumber())
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
