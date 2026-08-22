"use client"

import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useAddPasskey } from "@better-auth-ui/react/plugins/passkey"
import { Fingerprint } from "lucide-react"
import type { SyntheticEvent } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"

export type AddPasskeyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPasskeyDialog({
  open,
  onOpenChange
}: AddPasskeyDialogProps) {
  const { authClient, localization } = useAuth<PasskeyAuthClient>()
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin)

  const { mutate: addPasskey, isPending: isAdding } = useAddPasskey(authClient)

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement)
    const name = (formData.get("name") as string)?.trim()

    addPasskey(name ? { name } : undefined, {
      onSuccess: () => onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>
              <Fingerprint />
              {passkeyLocalization.addPasskey}
            </DialogTitle>

            <DialogDescription>
              {passkeyLocalization.passkeysDescription}
            </DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel htmlFor="passkey-name">
              {passkeyLocalization.name}
            </FieldLabel>

            <Input
              id="passkey-name"
              name="name"
              autoFocus
              placeholder={localization.settings.optional}
              disabled={isAdding}
            />

            <FieldError />
          </Field>

          <DialogFooter>
            <DialogClose
              className={buttonVariants({ variant: "outline" })}
              disabled={isAdding}
              type="button"
            >
              {localization.settings.cancel}
            </DialogClose>

            <Button type="submit" disabled={isAdding}>
              {isAdding && <Spinner />}

              {passkeyLocalization.addPasskey}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
