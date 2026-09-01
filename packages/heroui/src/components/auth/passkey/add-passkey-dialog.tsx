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
  Form,
  Input,
  Label,
  Spinner,
  TextField
} from "@heroui/react"
import { type SyntheticEvent, useRef } from "react"

import { passkeyPlugin } from "../../../lib/auth/passkey-plugin"
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

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement)
    const name = (formData.get("name") as string)?.trim()

    submitRequest({
      ...(name ? { name } : {}),
      ...(authenticatorAttachment ? { authenticatorAttachment } : {})
    } as AddPasskeyParams<PasskeyAuthClient>)
  }

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
            <Form onSubmit={handleSubmit}>
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

                <TextField
                  className="mt-4"
                  id="name"
                  name="name"
                  isDisabled={addPasskey.isPending}
                  isInvalid={addPasskey.isError}
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
              </AlertDialog.Body>

              <AlertDialog.Footer>
                <Button
                  slot="close"
                  variant="tertiary"
                  isDisabled={addPasskey.isPending}
                >
                  {localization.settings.cancel}
                </Button>

                <Button type="submit" isPending={addPasskey.isPending}>
                  {addPasskey.isPending && (
                    <Spinner color="current" size="sm" />
                  )}

                  {passkeyLocalization.addPasskey}
                </Button>
              </AlertDialog.Footer>
            </Form>
          )}
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
