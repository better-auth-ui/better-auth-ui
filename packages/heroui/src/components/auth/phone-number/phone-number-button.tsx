import { type AuthView, authMutationKeys } from "@better-auth-ui/core"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { Lock, Smartphone } from "@gravity-ui/icons"
import { cn, Link } from "@heroui/react"
import { buttonVariants } from "@heroui/styles"
import { useIsMutating } from "@tanstack/react-query"

import { phoneNumberPlugin } from "../../../lib/auth/phone-number-plugin"

export type PhoneNumberButtonProps = {
  /** Current auth view. */
  view?: AuthView
}

/** Switch between phone-number and password sign-in. */
export function PhoneNumberButton({ view }: PhoneNumberButtonProps) {
  const { basePaths, emailAndPassword, localization, viewPaths } = useAuth()
  const { localization: phoneLocalization, viewPaths: phoneNumberViewPaths } =
    useAuthPlugin(phoneNumberPlugin)
  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0
  const isPhoneNumberView = view === "phoneNumber"

  if (isPhoneNumberView && !emailAndPassword?.enabled) return null

  return (
    <Link
      href={`${basePaths.auth}/${
        isPhoneNumberView
          ? viewPaths.auth.signIn
          : phoneNumberViewPaths.auth.phoneNumber
      }`}
      isDisabled={isPending}
      className={cn(
        buttonVariants({ variant: "tertiary" }),
        "w-full gap-2",
        isPending && "status-disabled"
      )}
    >
      {isPhoneNumberView ? <Lock /> : <Smartphone />}
      {localization.auth.continueWith.replace(
        "{{provider}}",
        isPhoneNumberView
          ? localization.auth.password
          : phoneLocalization.phoneNumber
      )}
    </Link>
  )
}
