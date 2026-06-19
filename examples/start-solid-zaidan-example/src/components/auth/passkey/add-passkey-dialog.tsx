import {
  addPasskeyOptions,
  createAuthMutation,
  type PasskeyAuthClient,
  useAuth
} from "@better-auth-ui/solid"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

export function AddPasskeyDialog(props: {
  onOpenChange: (open: boolean) => void
  onPasskeyAdded: () => void
}) {
  const auth = useAuth()
  const labels = () => passkeyLabels(auth)
  const addPasskey = createAuthMutation(() => ({
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

        <div class="grid gap-2">
          <Label for="passkey-name">{labels().name}</Label>
          <Input
            autofocus
            disabled={addPasskey.isPending}
            id="passkey-name"
            name="name"
            placeholder={auth.localization.settings.optional}
          />
        </div>

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
