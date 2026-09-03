"use client"

import {
  type AuthView,
  authMutationKeys,
  validateEmailAddress
} from "@better-auth-ui/core"
import {
  type SiweAuthClient,
  siweMutationKeys
} from "@better-auth-ui/core/plugins/siwe"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useSignInSiwe } from "@better-auth-ui/react/plugins/siwe"
import { useIsMutating } from "@tanstack/react-query"
import { Wallet } from "lucide-react"
import { useState } from "react"

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
import {
  isAuthFormFieldInvalid,
  runAuthFormAction,
  useAuthForm
} from "../auth-form"

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

  const complete = async (email?: string) => {
    await signIn.mutateAsync(email ? { email } : undefined, {
      onSuccess: () => {
        setOpen(false)
        navigate({ to: redirectTo })
      }
    })
  }

  const form = useAuthForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      await complete(value.email.trim() || undefined)
    }
  })

  if (view === "signUp") return null

  return (
    <form.AppForm>
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        className={cn("w-full", isPending && "pointer-events-none opacity-50")}
        onClick={() => {
          if (plugin.email === "none") {
            void runAuthFormAction(form, () => complete())
            return
          }
          setOpen(true)
        }}
      >
        {signIn.isPending ? <Spinner /> : <Wallet />}
        {plugin.localization.continueWithEthereum}
      </Button>

      {plugin.email === "none" && <form.AuthFormServerError />}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form.AuthFormRoot className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet />
                {plugin.localization.continueWithEthereum}
              </DialogTitle>
              <DialogDescription>
                {plugin.localization.emailDescription}
              </DialogDescription>
            </DialogHeader>
            <form.AppField
              name="email"
              validators={{
                onChange: ({ value }) =>
                  validateEmailAddress(value, {
                    invalidMessage: localization.auth.invalidEmail,
                    requiredMessage:
                      plugin.email === "required"
                        ? localization.auth.fieldRequired
                        : undefined
                  })
              }}
            >
              {(field) => {
                const isInvalid = isAuthFormFieldInvalid(field.state.meta)
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="siwe-email">
                      {plugin.email === "required"
                        ? plugin.localization.email
                        : plugin.localization.emailOptional}
                    </FieldLabel>
                    <Input
                      id="siwe-email"
                      name={field.name}
                      type="email"
                      autoComplete="email"
                      required={plugin.email === "required"}
                      disabled={signIn.isPending}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                    />
                    <FieldDescription>
                      {plugin.localization.emailDescription}
                    </FieldDescription>
                    <field.AuthFormFieldError />
                  </Field>
                )
              }}
            </form.AppField>
            <form.AuthFormServerError />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={signIn.isPending}
                onClick={() => setOpen(false)}
              >
                {localization.settings.cancel}
              </Button>
              <form.AuthFormSubmitButton disabled={signIn.isPending}>
                {signIn.isPending && <Spinner />}
                {plugin.localization.signMessage}
              </form.AuthFormSubmitButton>
            </DialogFooter>
          </form.AuthFormRoot>
        </DialogContent>
      </Dialog>
    </form.AppForm>
  )
}
