import {
  type AuthView,
  authMutationKeys,
  authQueryKeys
} from "@better-auth-ui/core"
import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  usePasskeyAutoFill,
  useSignInPasskey
} from "@better-auth-ui/react/plugins/passkey"
import { Fingerprint } from "@gravity-ui/icons"
import { Button, Spinner } from "@heroui/react"
import { useIsMutating, useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"

import { passkeyPlugin } from "../../../lib/auth/passkey-plugin"

export type PasskeyButtonProps = {
  autoFill?: boolean
  /** @remarks `AuthView` */
  view?: AuthView
}

export function PasskeyButton({ autoFill = true, view }: PasskeyButtonProps) {
  const { authClient, localization, redirectTo, navigate } = useAuth()
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin)
  const queryClient = useQueryClient()

  const handleSuccess = useCallback(async () => {
    await queryClient.invalidateQueries(
      { queryKey: authQueryKeys.session },
      { cancelRefetch: false }
    )
    navigate({ to: redirectTo })
  }, [navigate, queryClient, redirectTo])
  const fetchOptions = useMemo(
    () => ({ onSuccess: handleSuccess }),
    [handleSuccess]
  )

  const { mutate: signInPasskey, isPending: passkeyPending } = useSignInPasskey(
    authClient as PasskeyAuthClient
  )

  // Surface passkeys in the browser's autofill dropdown on every view where
  // this button is shown.
  usePasskeyAutoFill(authClient as PasskeyAuthClient, {
    enabled: autoFill && view !== "signUp",
    fetchOptions
  })

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
      onPress={() => signInPasskey({ autoFill: false, fetchOptions })}
    >
      {passkeyPending ? <Spinner color="current" size="sm" /> : <Fingerprint />}
      {localization.auth.continueWith.replace(
        "{{provider}}",
        passkeyLocalization.passkey
      )}
    </Button>
  )
}
