"use client"

import { type AuthView, authMutationKeys } from "@better-auth-ui/core"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useIsMutating } from "@tanstack/react-query"
import { KeyRound, Lock } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { emailOtpPlugin } from "@/lib/auth/email-otp-plugin"
import { cn } from "@/lib/utils"

export type EmailOtpButtonProps = {
  /** @remarks `AuthView` */
  view?: AuthView
}

/**
 * Toggle button between password sign-in and the emailed-code route.
 *
 * @param view - Current auth view. On `"emailOtp"` this links back to password sign-in.
 */
export function EmailOtpButton({ view }: EmailOtpButtonProps) {
  const { basePaths, emailAndPassword, localization, viewPaths, Link } =
    useAuth()
  const { localization: emailOtpLocalization, viewPaths: emailOtpViewPaths } =
    useAuthPlugin(emailOtpPlugin)

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0

  const isEmailOtpView = view === "emailOtp"

  // On the code view this button switches back to password sign-in. With
  // password auth disabled there's nowhere to switch to, so hide it.
  if (isEmailOtpView && !emailAndPassword?.enabled) return null

  return (
    <Link
      href={`${basePaths.auth}/${isEmailOtpView ? viewPaths.auth.signIn : emailOtpViewPaths.auth.emailOtp}`}
      aria-disabled={isPending || undefined}
      tabIndex={isPending ? -1 : undefined}
      onClick={(event) => {
        if (isPending) event.preventDefault()
      }}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "w-full",
        isPending && "opacity-50 pointer-events-none"
      )}
    >
      {isEmailOtpView ? <Lock /> : <KeyRound />}

      {localization.auth.continueWith.replace(
        "{{provider}}",
        isEmailOtpView
          ? localization.auth.password
          : emailOtpLocalization.emailOtp
      )}
    </Link>
  )
}
