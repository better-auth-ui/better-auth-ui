"use client"

import {
  createPhoneNumberValue,
  type PhoneNumberAuthClient
} from "@better-auth-ui/core/plugins/phone-number"
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
import { FieldDescription } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { cn } from "@/lib/utils"
import { OtpField } from "../otp-field"
import { InternationalPhoneField } from "./international-phone-field"
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
  const {
    adapter,
    countries,
    defaultCountry,
    locale,
    localization,
    otpLength
  } = useAuthPlugin(phoneNumberPlugin)
  const phoneClient = authClient as PhoneNumberAuthClient
  const { data: session } = useSession(phoneClient)
  const currentPhoneNumber =
    (session?.user as PhoneNumberUser | undefined)?.phoneNumber ?? ""
  const [phoneNumber, setPhoneNumber] = useState(() =>
    createPhoneNumberValue("", defaultCountry, adapter)
  )
  const [code, setCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [fieldError, setFieldError] = useState<string>()

  useEffect(() => {
    if (session) {
      setPhoneNumber(
        createPhoneNumberValue(currentPhoneNumber, defaultCountry, adapter)
      )
    }
  }, [adapter, currentPhoneNumber, defaultCountry, session])

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
        setPhoneNumber(createPhoneNumberValue("", defaultCountry, adapter))
        toast.success(localization.phoneNumberRemoved)
      }
    }
  )
  const isPending = isSending || isVerifying || isRemoving

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!phoneNumber.e164) {
      setFieldError(localization.invalidPhoneNumber)
      return
    }
    if (!codeSent) {
      sendOtp({ phoneNumber: phoneNumber.e164 })
      return
    }

    verify({ phoneNumber: phoneNumber.e164, code, updatePhoneNumber: true })
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
                    phoneNumber.display
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
            ) : session ? (
              <InternationalPhoneField
                adapter={adapter}
                countryCodes={countries}
                countryLabel={localization.country}
                disabled={isPending}
                error={fieldError}
                locale={locale}
                phoneLabel={localization.phoneNumber}
                placeholder={localization.phoneNumberPlaceholder}
                value={phoneNumber}
                onChange={(value) => {
                  setPhoneNumber(value)
                  setFieldError(undefined)
                }}
              />
            ) : (
              <Skeleton className="h-14 w-full" />
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
                  setPhoneNumber(
                    createPhoneNumberValue(
                      currentPhoneNumber,
                      defaultCountry,
                      adapter
                    )
                  )
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
