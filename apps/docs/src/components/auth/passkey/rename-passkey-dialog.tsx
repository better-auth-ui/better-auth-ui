"use client"

import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useUpdatePasskey } from "@better-auth-ui/react/plugins/passkey"
import { useEffect } from "react"
import { buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"
import { useAuthForm } from "../auth-form"
import type { ListedPasskey } from "./delete-passkey-dialog"

export function RenamePasskeyDialog({
  open,
  onOpenChange,
  passkey
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  passkey: ListedPasskey
}) {
  const { authClient, localization } = useAuth<PasskeyAuthClient>()
  const { localization: labels } = useAuthPlugin(passkeyPlugin)
  const updatePasskey = useUpdatePasskey(authClient, {
    onSuccess: () => onOpenChange(false)
  })
  const form = useAuthForm({
    defaultValues: { name: passkey.name ?? "" },
    onSubmit: ({ value }) => {
      const name = value.name.trim()
      if (name) updatePasskey.mutate({ id: passkey.id, name })
    }
  })

  useEffect(() => {
    if (open) form.reset({ name: passkey.name ?? "" })
  }, [form, open, passkey.name])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form.AppForm>
          <form.AuthFormRoot className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle>{labels.renamePasskey}</DialogTitle>
            </DialogHeader>
            <form.AppField name="name">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={`passkey-name-${passkey.id}`}>
                    {labels.name}
                  </FieldLabel>
                  <Input
                    id={`passkey-name-${passkey.id}`}
                    name={field.name}
                    autoFocus
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    required
                  />
                </Field>
              )}
            </form.AppField>
            <DialogFooter>
              <DialogClose
                className={buttonVariants({ variant: "outline" })}
                type="button"
              >
                {localization.settings.cancel}
              </DialogClose>
              <form.AuthFormSubmitButton disabled={updatePasskey.isPending}>
                {updatePasskey.isPending && <Spinner />}
                {localization.settings.saveChanges}
              </form.AuthFormSubmitButton>
            </DialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}
