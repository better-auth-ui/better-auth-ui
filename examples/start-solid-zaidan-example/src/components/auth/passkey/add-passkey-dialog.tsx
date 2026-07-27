import {
  addPasskeyOptions,
  type PasskeyAuthClient,
  useAuth
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { Fingerprint } from "lucide-solid"
import { passkeyLabels } from "@/components/auth/passkey/passkey-localization"
import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export function AddPasskeyDialog(props: {
  onOpenChange: (open: boolean) => void
  onPasskeyAdded: () => void
}) {
  const auth = useAuth()
  const labels = () => passkeyLabels(auth)
  const addPasskey = createMutation(() => ({
    ...addPasskeyOptions(auth.authClient as PasskeyAuthClient),
    onSuccess: () => {
      props.onOpenChange(false)
      props.onPasskeyAdded()
    }
  }))

  const submitAddPasskey = (event: SubmitEvent) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const name = String(formData.get("name") ?? "").trim()

    addPasskey.mutate(
      (name ? { name } : undefined) as Parameters<typeof addPasskey.mutate>[0]
    )
  }

  return (
    <DialogContent>
      <form class="flex flex-col gap-6" onSubmit={submitAddPasskey}>
        <DialogHeader>
          <div class="flex size-10 items-center justify-center rounded-md bg-muted">
            <Fingerprint class="size-4.5" />
          </div>
          <DialogTitle>{labels().addPasskey}</DialogTitle>
          <DialogDescription>{labels().passkeysDescription}</DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel for="passkey-name">{labels().name}</FieldLabel>
          <Input
            autofocus
            disabled={addPasskey.isPending}
            id="passkey-name"
            name="name"
            placeholder={auth.localization.settings.optional}
          />
        </Field>

        <DialogFooter>
          <DialogClose
            as={Button}
            disabled={addPasskey.isPending}
            type="button"
            variant="outline"
          >
            {auth.localization.settings.cancel}
          </DialogClose>
          <Button disabled={addPasskey.isPending} type="submit">
            {addPasskey.isPending ? <Spinner /> : null}
            {labels().addPasskey}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
