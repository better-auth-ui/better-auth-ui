"use client"

import {
  type PasskeyAuthClient,
  useAddPasskey,
  useAuth,
  useAuthPlugin
} from "@better-auth-ui/react"
import { Fingerprint } from "lucide-react"
import type { SyntheticEvent } from "react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Fingerprint />
            </AlertDialogMedia>

            <AlertDialogTitle>
              {passkeyLocalization.addPasskey}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {passkeyLocalization.passkeysDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Field>
            <Label htmlFor="passkey-name">{passkeyLocalization.name}</Label>

            <Input
              id="passkey-name"
              name="name"
              autoFocus
              placeholder={localization.settings.optional}
              disabled={isAdding}
            />

            <FieldError />
          </Field>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isAdding}>
              {localization.settings.cancel}
            </AlertDialogCancel>

            <Button type="submit" disabled={isAdding}>
              {isAdding && <Spinner />}

              {passkeyLocalization.addPasskey}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
