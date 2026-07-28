"use client"

import { type AuthView, authMutationKeys } from "@better-auth-ui/core"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useIsMutating } from "@tanstack/react-query"
import { Lock, Smartphone } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { cn } from "@/lib/utils"

export type PhoneNumberButtonProps = {
  /** @remarks `AuthView` */
  view?: AuthView
}

/** Switch between the configured phone-number view and password sign-in. */
export function PhoneNumberButton({ view }: PhoneNumberButtonProps) {
  const { basePaths, emailAndPassword, localization, viewPaths, Link } =
    useAuth()
  const { localization: phoneLocalization, viewPaths: phoneNumberViewPaths } =
    useAuthPlugin(phoneNumberPlugin)
  const isPhoneNumberView = view === "phoneNumber"
  const isPending =
    useIsMutating({ mutationKey: authMutationKeys.signIn.all }) +
      useIsMutating({ mutationKey: authMutationKeys.signUp.all }) >
    0

  if (isPhoneNumberView && !emailAndPassword?.enabled) return null

  return (
    <Link
      href={`${basePaths.auth}/${
        isPhoneNumberView
          ? viewPaths.auth.signIn
          : phoneNumberViewPaths.auth.phoneNumber
      }`}
      aria-disabled={isPending || undefined}
      tabIndex={isPending ? -1 : undefined}
      onClick={(event) => {
        if (isPending) event.preventDefault()
      }}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "w-full",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      {isPhoneNumberView ? (
        <Lock data-icon="inline-start" />
      ) : (
        <Smartphone data-icon="inline-start" />
      )}

      {localization.auth.continueWith.replace(
        "{{provider}}",
        isPhoneNumberView
          ? localization.auth.password
          : phoneLocalization.phoneNumber
      )}
    </Link>
  )
}
