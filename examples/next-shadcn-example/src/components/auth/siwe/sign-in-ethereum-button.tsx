"use client"

import { type AuthView, authMutationKeys } from "@better-auth-ui/core"
import {
  type SiweAuthClient,
  siweMutationKeys
} from "@better-auth-ui/core/plugins/siwe"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useSignInSiwe } from "@better-auth-ui/react/plugins/siwe"
import { useIsMutating } from "@tanstack/react-query"
import { Wallet } from "lucide-react"
import { type FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { siwePlugin } from "@/lib/auth/siwe-plugin"
import { cn } from "@/lib/utils"

export type SignInEthereumButtonProps = { view?: AuthView }

export function SignInEthereumButton({ view }: SignInEthereumButtonProps) {
  const { authClient, localization, navigate, redirectTo } =
    useAuth<SiweAuthClient>()
  const plugin = useAuthPlugin(siwePlugin)
  const [open, setOpen] = useState(false)
  const signIn = useSignInSiwe(authClient, {
    connector: plugin.connector,
    domain: plugin.domain,
    uri: plugin.uri,
    statement: plugin.statement
  })
  const isPending =
    useIsMutating({ mutationKey: authMutationKeys.signIn.all }) +
      useIsMutating({ mutationKey: authMutationKeys.signUp.all }) +
      useIsMutating({ mutationKey: siweMutationKeys.all }) >
    0

  if (view === "signUp") return null

  const complete = (email?: string) => {
    signIn.mutate(email ? { email } : undefined, {
      onSuccess: () => {
        setOpen(false)
        navigate({ to: redirectTo })
      }
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = String(
      new FormData(event.currentTarget).get("email") ?? ""
    ).trim()
    complete(email || undefined)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        className={cn("w-full", isPending && "pointer-events-none opacity-50")}
        onClick={() => (plugin.email === "none" ? complete() : setOpen(true))}
      >
        {signIn.isPending ? <Spinner /> : <Wallet />}
        {plugin.localization.continueWithEthereum}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>
                <Wallet />
                {plugin.localization.continueWithEthereum}
              </DialogTitle>
              <DialogDescription>
                {plugin.localization.emailDescription}
              </DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor="siwe-email">
                {plugin.email === "required"
                  ? plugin.localization.email
                  : plugin.localization.emailOptional}
              </FieldLabel>
              <Input
                id="siwe-email"
                name="email"
                type="email"
                autoComplete="email"
                required={plugin.email === "required"}
                disabled={signIn.isPending}
              />
              <FieldDescription>
                {plugin.localization.emailDescription}
              </FieldDescription>
              <FieldError />
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={signIn.isPending}
                onClick={() => setOpen(false)}
              >
                {localization.settings.cancel}
              </Button>
              <Button type="submit" disabled={signIn.isPending}>
                {signIn.isPending && <Spinner />}
                {plugin.localization.signMessage}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
