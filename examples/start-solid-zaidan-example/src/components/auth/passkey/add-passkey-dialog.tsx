import {
  type PasskeyAuthClient,
  resolvePasskeyAuthenticatorAttachment
} from "@better-auth-ui/core/plugins/passkey"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useAddPasskey } from "@better-auth-ui/solid/plugins/passkey"
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"

export function AddPasskeyDialog(props: {
  onOpenChange: (open: boolean) => void
  onPasskeyAdded: () => void
}) {
  const auth = useAuth<PasskeyAuthClient>()
  const labels = () => passkeyLabels(auth)
  const { authenticatorAttachment } = useAuthPlugin(passkeyPlugin)
  const addPasskey = useAddPasskey(auth.authClient, () => ({
    onSuccess: () => {
      props.onOpenChange(false)
      props.onPasskeyAdded()
    }
  }))

  const submitAddPasskey = (event: SubmitEvent) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const name = String(formData.get("name") ?? "").trim()
    const attachment = resolvePasskeyAuthenticatorAttachment(
      formData.get("authenticatorAttachment")
    )

    addPasskey.mutate({
      ...(name ? { name } : {}),
      ...(attachment ? { authenticatorAttachment: attachment } : {})
    } as Parameters<typeof addPasskey.mutate>[0])
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

        {authenticatorAttachment !== false ? (
          <Field>
            <FieldLabel for="passkey-authenticator-attachment">
              {labels().authenticatorAttachment}
            </FieldLabel>

            <NativeSelect
              class="w-full"
              disabled={addPasskey.isPending}
              id="passkey-authenticator-attachment"
              name="authenticatorAttachment"
              value={authenticatorAttachment}
            >
              <NativeSelectOption value="any">
                {labels().anyAuthenticator}
              </NativeSelectOption>
              <NativeSelectOption value="platform">
                {labels().platformAuthenticator}
              </NativeSelectOption>
              <NativeSelectOption value="cross-platform">
                {labels().crossPlatformAuthenticator}
              </NativeSelectOption>
            </NativeSelect>

            <p class="text-muted-foreground text-sm">
              {labels().authenticatorAttachmentDescription}
            </p>
          </Field>
        ) : null}

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
