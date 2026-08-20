import { type AuthView, authMutationKeys } from "@better-auth-ui/core"
import {
  type SiweAuthClient,
  siweMutationKeys
} from "@better-auth-ui/core/plugins/siwe"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useSignInSiwe } from "@better-auth-ui/solid/plugins/siwe"
import { useIsMutating } from "@tanstack/solid-query"
import { Wallet } from "lucide-solid"
import { createSignal, Show } from "solid-js"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { siwePlugin } from "@/lib/auth/siwe-plugin"
import { cn } from "@/lib/utils"

export type SignInEthereumButtonProps = {
  /** @remarks `AuthView` */
  view?: AuthView
}

/**
 * "Continue with Ethereum" button backed by Better Auth's SIWE plugin.
 *
 * Signs straight in when the plugin's `email` mode is `"none"`. Otherwise it
 * collects an address-linked email first, because the server needs one to
 * create the account.
 */
export function SignInEthereumButton(props: SignInEthereumButtonProps) {
  const auth = useAuth<SiweAuthClient>()
  const plugin = useAuthPlugin(siwePlugin)
  const [open, setOpen] = createSignal(false)

  const signIn = useSignInSiwe(auth.authClient, () => ({
    connector: plugin.connector,
    domain: plugin.domain,
    uri: plugin.uri,
    statement: plugin.statement
  }))

  const signInMutating = useIsMutating(() => ({
    mutationKey: authMutationKeys.signIn.all
  }))
  const signUpMutating = useIsMutating(() => ({
    mutationKey: authMutationKeys.signUp.all
  }))
  const siweMutating = useIsMutating(() => ({
    mutationKey: siweMutationKeys.all
  }))
  const isPending = () =>
    signInMutating() + signUpMutating() + siweMutating() > 0

  const complete = (email?: string) => {
    signIn.mutate(email ? { email } : undefined, {
      onSuccess: () => {
        setOpen(false)
        auth.navigate({ to: auth.redirectTo })
      }
    })
  }

  const submit = (event: SubmitEvent) => {
    event.preventDefault()
    const email = String(
      new FormData(event.currentTarget as HTMLFormElement).get("email") ?? ""
    ).trim()

    complete(email || undefined)
  }

  return (
    <Show when={props.view !== "signUp"}>
      <Button
        class={cn("w-full", isPending() && "pointer-events-none")}
        disabled={isPending()}
        onClick={() => (plugin.email === "none" ? complete() : setOpen(true))}
        type="button"
        variant="outline"
      >
        <Show
          fallback={<Wallet data-icon="inline-start" />}
          when={signIn.isPending}
        >
          <Spinner data-icon="inline-start" />
        </Show>
        {plugin.localization.continueWithEthereum}
      </Button>

      <Dialog onOpenChange={setOpen} open={open()}>
        <DialogContent>
          <form class="flex flex-col gap-6" onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>
                {plugin.localization.continueWithEthereum}
              </DialogTitle>
              <DialogDescription>
                {plugin.localization.emailDescription}
              </DialogDescription>
            </DialogHeader>

            <Field>
              <FieldLabel for="siwe-email">
                {plugin.email === "required"
                  ? plugin.localization.email
                  : plugin.localization.emailOptional}
              </FieldLabel>
              <Input
                autocomplete="email"
                disabled={signIn.isPending}
                id="siwe-email"
                name="email"
                required={plugin.email === "required"}
                type="email"
              />
              <FieldDescription>
                {plugin.localization.emailDescription}
              </FieldDescription>
            </Field>

            <DialogFooter>
              <Button
                disabled={signIn.isPending}
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                {auth.localization.settings.cancel}
              </Button>
              <Button disabled={signIn.isPending} type="submit">
                <Show when={signIn.isPending}>
                  <Spinner data-icon="inline-start" />
                </Show>
                {plugin.localization.signMessage}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Show>
  )
}
