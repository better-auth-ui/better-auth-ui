import type { AuthView } from "@better-auth-ui/core"
import {
  type PasskeyAuthClient,
  signInPasskeyOptions,
  useAuth
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { Fingerprint } from "lucide-solid"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PasskeyButtonProps = {
  view?: AuthView
}

export function PasskeyButton(props: PasskeyButtonProps) {
  const auth = useAuth()
  const passkeyLocalization = () =>
    (auth.plugins.find((plugin) => plugin.id === "passkey")?.localization as
      | { passkey?: string }
      | undefined) ?? {}
  const signInPasskey = createMutation(() => ({
    ...signInPasskeyOptions(auth.authClient as PasskeyAuthClient),
    onSuccess: () => auth.navigate({ to: auth.redirectTo })
  }))

  if (props.view === "signUp") return null

  return (
    <Button
      class={cn(
        "w-full",
        signInPasskey.isPending && "pointer-events-none opacity-50"
      )}
      disabled={signInPasskey.isPending}
      onClick={() => signInPasskey.mutate(undefined as never)}
      type="button"
      variant="outline"
    >
      <Fingerprint />
      {auth.localization.auth.continueWith.replace(
        "{{provider}}",
        passkeyLocalization().passkey ?? "Passkey"
      )}
    </Button>
  )
}
