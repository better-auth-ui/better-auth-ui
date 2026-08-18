import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey"
import { useAuth } from "@better-auth-ui/solid"
import { useUpdatePasskey } from "@better-auth-ui/solid/plugins/passkey"
import { createEffect, createSignal } from "solid-js"
import { passkeyLabels } from "@/components/auth/passkey/passkey-localization"
import type { ListedPasskey } from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export function RenamePasskeyDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  passkey: ListedPasskey
}) {
  const auth = useAuth<PasskeyAuthClient>()
  const labels = () => passkeyLabels(auth)
  const [name, setName] = createSignal(props.passkey.name ?? "")
  createEffect(() => {
    if (props.open) setName(props.passkey.name ?? "")
  })

  const updatePasskey = useUpdatePasskey(auth.authClient, () => ({
    onSuccess: () => props.onOpenChange(false)
  }))
  const submit = (event: SubmitEvent) => {
    event.preventDefault()
    const nextName = name().trim()
    if (nextName) updatePasskey.mutate({ id: props.passkey.id, name: nextName })
  }

  return (
    <DialogContent>
      <form class="flex flex-col gap-6" onSubmit={submit}>
        <DialogHeader>
          <DialogTitle>{labels().renamePasskey}</DialogTitle>
        </DialogHeader>
        <Field>
          <FieldLabel for={`passkey-name-${props.passkey.id}`}>
            {labels().name}
          </FieldLabel>
          <Input
            id={`passkey-name-${props.passkey.id}`}
            autofocus
            value={name()}
            onInput={(event) => setName(event.currentTarget.value)}
            required
          />
        </Field>
        <DialogFooter>
          <DialogClose as={Button} type="button" variant="outline">
            {auth.localization.settings.cancel}
          </DialogClose>
          <Button
            disabled={!name().trim() || updatePasskey.isPending}
            type="submit"
          >
            {updatePasskey.isPending ? <Spinner /> : null}
            {auth.localization.settings.saveChanges}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
