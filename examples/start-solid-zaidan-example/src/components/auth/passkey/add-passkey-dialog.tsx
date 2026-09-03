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
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"
import { createAuthForm } from "../auth-form"
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
  const addPasskey = useAddPasskey(auth.authClient)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      addPasskey.reset()
      setPendingRequest()
    }
    props.onOpenChange(open)
  }

  const submitRequest = async (
    request: AddPasskeyParams<PasskeyAuthClient>
  ) => {
    const requestWithCallbacks = {
      ...request,
      fetchOptions: {
        ...request?.fetchOptions,
        onSuccess: () => {
          props.onOpenChange(false)
          props.onPasskeyAdded()
        }
      }
    }
    setPendingRequest(requestWithCallbacks)
    await addPasskey.mutateAsync(requestWithCallbacks)
  }

  const form = createAuthForm(() => ({
    defaultValues: { name: "" },
    onSubmit: async ({ value }) => {
      const name = value.name.trim()
      await submitRequest({
        ...(name ? { name } : {}),
        ...(authenticatorAttachment ? { authenticatorAttachment } : {})
      } as Parameters<typeof addPasskey.mutateAsync>[0])
    }
  }))

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
                if (request) return submitRequest(request)
              }}
            />
          </>
        }
      >
        <form.AppForm>
          <form.AuthFormRoot class="flex flex-col gap-6">
            <DialogHeader>
              <div class="flex size-10 items-center justify-center rounded-md bg-muted">
                <Fingerprint class="size-4.5" />
              </div>
              <DialogTitle>{labels().addPasskey}</DialogTitle>
              <DialogDescription>
                {labels().passkeysDescription}
              </DialogDescription>
            </DialogHeader>

            <form.AppField name="name">
              {(field) => (
                <Field>
                  <FieldLabel for="passkey-name">{labels().name}</FieldLabel>
                  <Input
                    autofocus
                    disabled={addPasskey.isPending}
                    id="passkey-name"
                    name={field().name}
                    placeholder={auth.localization.settings.optional}
                    value={field().state.value}
                    onBlur={field().handleBlur}
                    onInput={(event) =>
                      field().handleChange(event.currentTarget.value)
                    }
                  />
                </Field>
              )}
            </form.AppField>
            <form.AuthFormServerError />

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
              <form.AuthFormSubmitButton disabled={addPasskey.isPending}>
                {addPasskey.isPending ? <Spinner /> : null}
                {labels().addPasskey}
              </form.AuthFormSubmitButton>
            </DialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </Show>
    </DialogContent>
  )
}
