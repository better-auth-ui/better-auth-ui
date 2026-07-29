import {
  type AuthView,
  authMutationKeys,
  getAuthLinkURL
} from "@better-auth-ui/core"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { Keyboard, Lock } from "@gravity-ui/icons"
import { cn, Link } from "@heroui/react"
import { buttonVariants } from "@heroui/styles"
import { useIsMutating } from "@tanstack/react-query"

import { emailOtpPlugin } from "../../../lib/auth/email-otp-plugin"

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
  const { basePaths, emailAndPassword, localization, redirectTo, viewPaths } =
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
      href={getAuthLinkURL(
        `${basePaths.auth}/${isEmailOtpView ? viewPaths.auth.signIn : emailOtpViewPaths.auth.emailOtp}`,
        redirectTo
      )}
      isDisabled={isPending}
      className={cn(
        buttonVariants({ variant: "tertiary" }),
        "w-full gap-2",
        isPending && "status-disabled"
      )}
    >
      {isEmailOtpView ? <Lock /> : <Keyboard />}

      {localization.auth.continueWith.replace(
        "{{provider}}",
        isEmailOtpView
          ? localization.auth.password
          : emailOtpLocalization.emailOtp
      )}
    </Link>
  )
}
