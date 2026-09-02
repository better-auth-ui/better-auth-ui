import { isSessionNotFreshError } from "@better-auth-ui/core"
import type {
  AddPasskeyParams,
  PasskeyAuthClient
} from "@better-auth-ui/core/plugins/passkey"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useAddPasskey } from "@better-auth-ui/react/plugins/passkey"
import { Fingerprint } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  TextField
} from "@heroui/react"
import { useRef } from "react"

import { passkeyPlugin } from "../../../lib/auth/passkey-plugin"
import { useAuthForm } from "../auth-form"
import { FreshSessionPrompt } from "../settings/security/fresh-session-prompt"

export type AddPasskeyDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPasskeyDialog({
  isOpen,
  onOpenChange
}: AddPasskeyDialogProps) {
  const { authClient, localization } = useAuth()
  const { authenticatorAttachment, localization: passkeyLocalization } =
    useAuthPlugin(passkeyPlugin)

  const addPasskey = useAddPasskey(authClient as PasskeyAuthClient)
  const pendingRequest = useRef<AddPasskeyParams<PasskeyAuthClient>>(undefined)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      addPasskey.reset()
      pendingRequest.current = undefined
    }
    onOpenChange(open)
  }

  const submitRequest = (request: AddPasskeyParams<PasskeyAuthClient>) => {
    const requestWithCallbacks = {
      ...request,
      fetchOptions: {
        ...request?.fetchOptions,
        onSuccess: () => handleOpenChange(false)
      }
    }
    pendingRequest.current = requestWithCallbacks
    addPasskey.mutate(requestWithCallbacks)
  }

  const form = useAuthForm({
    defaultValues: { name: "" },
    onSubmit: ({ value }) => {
      const name = value.name.trim()
      submitRequest({
        ...(name ? { name } : {}),
        ...(authenticatorAttachment ? { authenticatorAttachment } : {})
      } as AddPasskeyParams<PasskeyAuthClient>)
    }
  })

  const needsFreshSession = isSessionNotFreshError(addPasskey.error)

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          {needsFreshSession ? (
            <>
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Heading className="sr-only">
                  {localization.settings.freshSessionTitle}
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <FreshSessionPrompt
                  onFresh={() => {
                    const request = pendingRequest.current
                    if (request) submitRequest(request)
                  }}
                />
              </AlertDialog.Body>
            </>
          ) : (
            <form.AppForm>
              <form.AuthFormRoot>
                <AlertDialog.CloseTrigger />

                <AlertDialog.Header>
                  <AlertDialog.Icon status="default">
                    <Fingerprint />
                  </AlertDialog.Icon>

                  <AlertDialog.Heading>
                    {passkeyLocalization.addPasskey}
                  </AlertDialog.Heading>
                </AlertDialog.Header>

                <AlertDialog.Body className="overflow-visible">
                  <p className="text-muted text-sm">
                    {passkeyLocalization.passkeysDescription}
                  </p>

                  <form.AppField name="name">
                    {(field) => (
                      <TextField
                        className="mt-4"
                        id="name"
                        name={field.name}
                        isDisabled={addPasskey.isPending}
                        isInvalid={addPasskey.isError}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                      >
                        <Label>{passkeyLocalization.name}</Label>

                        <Input
                          autoFocus
                          placeholder={localization.settings.optional}
                          variant="secondary"
                        />

                        <FieldError>
                          {addPasskey.error?.error?.message ??
                            addPasskey.error?.message}
                        </FieldError>
                      </TextField>
                    )}
                  </form.AppField>
                </AlertDialog.Body>

                <AlertDialog.Footer>
                  <Button
                    slot="close"
                    variant="tertiary"
                    isDisabled={addPasskey.isPending}
                  >
                    {localization.settings.cancel}
                  </Button>

                  <form.AuthFormSubmitButton isDisabled={addPasskey.isPending}>
                    {addPasskey.isPending && (
                      <Spinner color="current" size="sm" />
                    )}

                    {passkeyLocalization.addPasskey}
                  </form.AuthFormSubmitButton>
                </AlertDialog.Footer>
              </form.AuthFormRoot>
            </form.AppForm>
          )}
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
