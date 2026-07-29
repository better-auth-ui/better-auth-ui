import type { AuthView } from "@better-auth-ui/core"
import { AuthLink, useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { Lock, Smartphone } from "lucide-solid"
import { Show } from "solid-js"

import { buttonVariants } from "@/components/ui/button"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { cn } from "@/lib/utils"

export type PhoneNumberButtonProps = {
  view?: AuthView
}

/** Switch between phone-number and password sign-in. */
export function PhoneNumberButton(props: PhoneNumberButtonProps) {
  const auth = useAuth()
  const { localization: phoneLocalization, viewPaths: phoneNumberViewPaths } =
    useAuthPlugin(phoneNumberPlugin)
  const isPhoneNumberView = () => props.view === "phoneNumber"
  const isVisible = () => !isPhoneNumberView() || auth.emailAndPassword?.enabled

  return (
    <Show when={isVisible()}>
      <AuthLink
        class={cn(buttonVariants({ variant: "outline" }), "w-full")}
        href={`${auth.basePaths.auth}/${
          isPhoneNumberView()
            ? auth.viewPaths.auth.signIn
            : phoneNumberViewPaths.auth.phoneNumber
        }`}
      >
        <Show fallback={<Smartphone />} when={isPhoneNumberView()}>
          <Lock />
        </Show>
        {auth.localization.auth.continueWith.replace(
          "{{provider}}",
          isPhoneNumberView()
            ? auth.localization.auth.password
            : phoneLocalization.phoneNumber
        )}
      </AuthLink>
    </Show>
  )
}
