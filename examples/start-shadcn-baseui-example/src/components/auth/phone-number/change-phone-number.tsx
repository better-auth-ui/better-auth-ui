"use client"

import type { PhoneNumberAuthClient } from "@better-auth-ui/core/plugins/phone-number"
import {
  useAuth,
  useAuthPlugin,
  useSession,
  useUpdateUser
} from "@better-auth-ui/react"
import {
  useSendPhoneNumberOtp,
  useVerifyPhoneNumber
} from "@better-auth-ui/react/plugins/phone-number"
import { type SyntheticEvent, useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { cn } from "@/lib/utils"
import { OtpField } from "../otp-field"
import { RemovePhoneNumberDialog } from "./remove-phone-number-dialog"

type PhoneNumberUser = {
  phoneNumber?: string | null
}

export type ChangePhoneNumberProps = {
  className?: string
}

/** Add, replace, or remove the authenticated user's verified phone number. */
export function ChangePhoneNumber({ className }: ChangePhoneNumberProps) {
  const { authClient } = useAuth()
  const { localization, otpLength } = useAuthPlugin(phoneNumberPlugin)
  const phoneClient = authClient as PhoneNumberAuthClient
  const { data: session } = useSession(phoneClient)
  const currentPhoneNumber =
    (session?.user as PhoneNumberUser | undefined)?.phoneNumber ?? ""
  const [phoneNumber, setPhoneNumber] = useState("")
  const [code, setCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [fieldError, setFieldError] = useState<string>()

  useEffect(() => {
    if (session) setPhoneNumber(currentPhoneNumber)
  }, [currentPhoneNumber, session])

  const { mutate: sendOtp, isPending: isSending } = useSendPhoneNumberOtp(
    phoneClient,
    { onSuccess: () => setCodeSent(true) }
  )
  const { mutate: verify, isPending: isVerifying } = useVerifyPhoneNumber(
    phoneClient,
    {
      onError: () => setCode(""),
      onSuccess: () => {
        setCode("")
        setCodeSent(false)
        toast.success(localization.phoneNumberUpdated)
      }
    }
  )
  const { mutate: updateUser, isPending: isRemoving } = useUpdateUser(
    phoneClient,
    {
      onSuccess: () => {
        setPhoneNumber("")
        toast.success(localization.phoneNumberRemoved)
      }
    }
  )
  const isPending = isSending || isVerifying || isRemoving

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!codeSent) {
      sendOtp({ phoneNumber })
      return
    }

    verify({ phoneNumber, code, updatePhoneNumber: true })
  }
  const removePhoneNumber = () =>
    updateUser({
      phoneNumber: null
    } as Parameters<PhoneNumberAuthClient["updateUser"]>[0])

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold">
        {localization.changePhoneNumber}
      </h2>
      <form onSubmit={handleSubmit}>
        <Card className={cn(className)}>
          <CardContent className="flex flex-col gap-6">
            {codeSent ? (
              <>
                <FieldDescription>
                  {localization.codeSentTo.replace(
                    "{{phoneNumber}}",
                    phoneNumber
                  )}
                </FieldDescription>
                <OtpField
                  autoFocus
                  disabled={isPending}
                  label={localization.phoneCode}
                  length={otpLength}
                  name="otp"
                  value={code}
                  onChange={setCode}
                />
              </>
            ) : (
              <Field data-invalid={Boolean(fieldError)}>
                <FieldLabel htmlFor="settingsPhoneNumber">
                  {localization.phoneNumber}
                </FieldLabel>
                {session ? (
                  <Input
                    id="settingsPhoneNumber"
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={phoneNumber}
                    placeholder={localization.phoneNumberPlaceholder}
                    required
                    disabled={isPending}
                    onChange={(event) => {
                      setPhoneNumber(event.target.value)
                      setFieldError(undefined)
                    }}
                    onInvalid={(event) => {
                      event.preventDefault()
                      setFieldError(event.currentTarget.validationMessage)
                    }}
                    aria-invalid={Boolean(fieldError)}
                  />
                ) : (
                  <Skeleton>
                    <Input className="invisible" />
                  </Skeleton>
                )}
                <FieldError>{fieldError}</FieldError>
              </Field>
            )}
          </CardContent>
          <CardFooter className="gap-3">
            {codeSent && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setCode("")
                  setCodeSent(false)
                  setPhoneNumber(currentPhoneNumber)
                }}
              >
                {localization.cancel}
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={
                isPending || !session || (codeSent && code.length !== otpLength)
              }
            >
              {(isSending || isVerifying) && <Spinner />}
              {codeSent
                ? localization.verifyCode
                : localization.updatePhoneNumber}
            </Button>
            {!codeSent && currentPhoneNumber && (
              <RemovePhoneNumberDialog
                cancelLabel={localization.cancel}
                description={localization.removePhoneNumberDescription}
                isPending={isRemoving}
                label={localization.removePhoneNumber}
                title={localization.removePhoneNumberTitle}
                onConfirm={removePhoneNumber}
              />
            )}
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
