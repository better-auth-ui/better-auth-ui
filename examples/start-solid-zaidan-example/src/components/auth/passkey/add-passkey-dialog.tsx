import { isSessionNotFreshError } from "@better-auth-ui/core"
import type {
  AddPasskeyParams,
  PasskeyAuthClient
} from "@better-auth-ui/core/plugins/passkey"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useAddPasskey } from "@better-auth-ui/solid/plugins/passkey"
import { Fingerprint } from "lucide-solid"
import { createSignal, Show } from "solid-js"
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"
import { FreshSessionPrompt } from "../settings/security/fresh-session-prompt"

export function AddPasskeyDialog(props: {
  onOpenChange: (open: boolean) => void
  onPasskeyAdded: () => void
}) {
  const auth = useAuth<PasskeyAuthClient>()
  const labels = () => passkeyLabels(auth)
  const { authenticatorAttachment } = useAuthPlugin(passkeyPlugin)
  const [pendingRequest, setPendingRequest] =
    createSignal<AddPasskeyParams<PasskeyAuthClient>>()
  const addPasskey = useAddPasskey(auth.authClient, () => ({
    onSuccess: () => {
      props.onOpenChange(false)
      props.onPasskeyAdded()
    }
  }))

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      addPasskey.reset()
      setPendingRequest()
    }
    props.onOpenChange(open)
  }

  const submitRequest = (request: AddPasskeyParams<PasskeyAuthClient>) => {
    setPendingRequest(request)
    addPasskey.mutate(request)
  }

  const submitAddPasskey = (event: SubmitEvent) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const name = String(formData.get("name") ?? "").trim()

    submitRequest({
      ...(name ? { name } : {}),
      ...(authenticatorAttachment ? { authenticatorAttachment } : {})
    } as Parameters<typeof addPasskey.mutate>[0])
  }

  return (
    <DialogContent>
      <Show
        when={!isSessionNotFreshError(addPasskey.error)}
        fallback={
          <>
            <DialogHeader>
              <DialogTitle class="sr-only">
                {auth.localization.settings.freshSessionTitle}
              </DialogTitle>
            </DialogHeader>
            <FreshSessionPrompt
              onFresh={() => {
                const request = pendingRequest()
                if (request) submitRequest(request)
              }}
            />
          </>
        }
      >
        <form class="flex flex-col gap-6" onSubmit={submitAddPasskey}>
          <DialogHeader>
            <div class="flex size-10 items-center justify-center rounded-md bg-muted">
              <Fingerprint class="size-4.5" />
            </div>
            <DialogTitle>{labels().addPasskey}</DialogTitle>
            <DialogDescription>
              {labels().passkeysDescription}
            </DialogDescription>
          </DialogHeader>

          <Field data-invalid={addPasskey.isError}>
            <FieldLabel for="passkey-name">{labels().name}</FieldLabel>
            <Input
              autofocus
              disabled={addPasskey.isPending}
              id="passkey-name"
              name="name"
              placeholder={auth.localization.settings.optional}
            />
            <Show when={addPasskey.error}>
              {(error) => (
                <FieldError>
                  {error().error?.message ?? error().message}
                </FieldError>
              )}
            </Show>
          </Field>

          <DialogFooter>
            <DialogClose
              as={Button}
              disabled={addPasskey.isPending}
              onClick={() => handleOpenChange(false)}
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
      </Show>
    </DialogContent>
  )
}
