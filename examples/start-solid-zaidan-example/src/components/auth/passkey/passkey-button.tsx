import { type AuthView, authMutationKeys } from "@better-auth-ui/core"
import {
  type PasskeyAuthClient,
  useAuth,
  useSignInPasskey
} from "@better-auth-ui/solid"
import { useIsMutating } from "@tanstack/solid-query"
import { Fingerprint } from "lucide-solid"
import { passkeyLabels } from "@/components/auth/passkey/passkey-localization"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export type PasskeyButtonProps = {
  view?: AuthView
}

export function PasskeyButton(props: PasskeyButtonProps) {
  const auth = useAuth()
  const labels = () => passkeyLabels(auth)
  const signInPasskey = useSignInPasskey(auth.authClient as PasskeyAuthClient, {
    onSuccess: () => auth.navigate({ to: auth.redirectTo })
  })
  const signInMutating = useIsMutating(() => ({
    mutationKey: authMutationKeys.signIn.all
  }))
  const signUpMutating = useIsMutating(() => ({
    mutationKey: authMutationKeys.signUp.all
  }))
  const isPending = () =>
    signInPasskey.isPending || signInMutating() + signUpMutating() > 0

  if (props.view === "signUp") return null

  return (
    <Button
      class={cn("w-full", isPending() && "pointer-events-none opacity-50")}
      disabled={isPending()}
      onClick={() => signInPasskey.mutate(undefined as never)}
      type="button"
      variant="outline"
    >
      {isPending() ? <Spinner /> : <Fingerprint />}
      {auth.localization.auth.continueWith.replace(
        "{{provider}}",
        labels().passkey
      )}
    </Button>
  )
}
