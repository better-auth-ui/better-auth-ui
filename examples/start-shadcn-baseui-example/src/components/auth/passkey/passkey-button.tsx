"use client"

import { type AuthView, authMutationKeys } from "@better-auth-ui/core"
import {
  type PasskeyAuthClient,
  useAuth,
  useAuthPlugin,
  useSignInPasskey
} from "@better-auth-ui/react"
import { useIsMutating } from "@tanstack/react-query"
import { Fingerprint } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"
import { cn } from "@/lib/utils"

export type PasskeyButtonProps = {
  /** @remarks `AuthView` */
  view?: AuthView
}

/**
 * "Continue with Passkey" button rendered alongside the password sign-in form.
 *
 * Hidden on the sign-up view where passkey sign-in isn't applicable.
 *
 * @param view - Current auth view. Hides the button on `"signUp"`.
 */
export function PasskeyButton({ view }: PasskeyButtonProps) {
  const { authClient, localization, redirectTo, navigate } = useAuth()
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin)

  const { mutate: signInPasskey, isPending: passkeyPending } = useSignInPasskey(
    authClient as PasskeyAuthClient,
    {
      onSuccess: () => navigate({ to: redirectTo })
    }
  )

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0

  // Passkey sign-in isn't relevant on the sign-up flow.
  if (view === "signUp") return null

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      className={cn("w-full", isPending && "pointer-events-none opacity-50")}
      onClick={() => signInPasskey()}
    >
      {passkeyPending ? <Spinner /> : <Fingerprint />}
      {localization.auth.continueWith.replace(
        "{{provider}}",
        passkeyLocalization.passkey
      )}
    </Button>
  )
}
