import { isReauthenticationRequiredError } from "@better-auth-ui/core"
import type {
  AddPasskeyParams,
  PasskeyAuthClient
} from "@better-auth-ui/core/plugins/passkey"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useAddPasskey } from "@better-auth-ui/solid/plugins/passkey"
import { Fingerprint } from "lucide-solid"
import { Show } from "solid-js"
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
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"
import { createAuthForm } from "../auth-form"
import { ReauthenticationAction } from "../reauthentication"

export function AddPasskeyDialog(props: {
  onOpenChange: (open: boolean) => void
  onPasskeyAdded: () => void
}) {
  const auth = useAuth<PasskeyAuthClient>()
  const labels = () => passkeyLabels(auth)
  const { authenticatorAttachment } = useAuthPlugin(passkeyPlugin)
  const addPasskey = useAddPasskey(auth.authClient)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      addPasskey.reset()
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
        when={!isReauthenticationRequiredError(addPasskey.error)}
        fallback={
          <>
            <DialogHeader>
              <DialogTitle class="sr-only">
                {auth.localization.settings.reauthenticationTitle}
              </DialogTitle>
            </DialogHeader>
            <ReauthenticationAction showTitle={false} />
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
              <form.AuthFormSubmitButton
                isPending={addPasskey.isPending}
                disabled={addPasskey.isPending}
              >
                {labels().addPasskey}
              </form.AuthFormSubmitButton>
            </DialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </Show>
    </DialogContent>
  )
}
