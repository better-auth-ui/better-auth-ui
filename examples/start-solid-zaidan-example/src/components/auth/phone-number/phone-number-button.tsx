import type { AuthView } from "@better-auth-ui/core"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { Link } from "@tanstack/solid-router"
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
      <Link
        class={cn(buttonVariants({ variant: "outline" }), "w-full")}
        params={{
          path: isPhoneNumberView()
            ? auth.viewPaths.auth.signIn
            : phoneNumberViewPaths.auth.phoneNumber
        }}
        to="/auth/$path"
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
      </Link>
    </Show>
  )
}
