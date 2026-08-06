import { type AuthView, authMutationKeys } from "@better-auth-ui/core"
import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useSignInPasskey } from "@better-auth-ui/react/plugins/passkey"
import { Fingerprint } from "@gravity-ui/icons"
import { Button, Spinner } from "@heroui/react"
import { useIsMutating } from "@tanstack/react-query"

import { passkeyPlugin } from "../../../lib/auth/passkey-plugin"

export type PasskeyButtonProps = {
  /** @remarks `AuthView` */
  view?: AuthView
}

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
      className="w-full"
      variant="tertiary"
      isDisabled={isPending}
      isPending={passkeyPending}
      onPress={() => signInPasskey()}
    >
      {passkeyPending ? <Spinner color="current" size="sm" /> : <Fingerprint />}
      {localization.auth.continueWith.replace(
        "{{provider}}",
        passkeyLocalization.passkey
      )}
    </Button>
  )
}
