import { type AuthView, getAuthLinkURL } from "@better-auth-ui/core"
import { AuthLink, useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { KeyRound, Lock } from "lucide-solid"
import { Show } from "solid-js"

import { buttonVariants } from "@/components/ui/button"
import { emailOtpPlugin } from "@/lib/auth/email-otp-plugin"
import { cn } from "@/lib/utils"

export type EmailOtpButtonProps = {
  /** Current auth view. On `"emailOtp"` this links back to password sign-in. */
  view?: AuthView
}

/** Toggle button between password sign-in and the emailed-code route. */
export function EmailOtpButton(props: EmailOtpButtonProps) {
  const auth = useAuth()
  const { localization: emailOtpLocalization, viewPaths: emailOtpViewPaths } =
    useAuthPlugin(emailOtpPlugin)

  const isEmailOtpView = () => props.view === "emailOtp"

  // On the code view this button switches back to password sign-in. With
  // password auth disabled there's nowhere to switch to, so hide it.
  const isVisible = () => !isEmailOtpView() || auth.emailAndPassword?.enabled

  return (
    <Show when={isVisible()}>
      <AuthLink
        class={cn(buttonVariants({ variant: "outline" }), "w-full")}
        href={getAuthLinkURL(
          `${auth.basePaths.auth}/${
            isEmailOtpView()
              ? auth.viewPaths.auth.signIn
              : (emailOtpViewPaths.auth.emailOtp as string)
          }`,
          auth.redirectTo
        )}
      >
        <Show fallback={<KeyRound />} when={isEmailOtpView()}>
          <Lock />
        </Show>

        {auth.localization.auth.continueWith.replace(
          "{{provider}}",
          isEmailOtpView()
            ? auth.localization.auth.password
            : emailOtpLocalization.emailOtp
        )}
      </AuthLink>
    </Show>
  )
}
