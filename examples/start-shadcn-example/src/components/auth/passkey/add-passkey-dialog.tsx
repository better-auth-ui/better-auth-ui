"use client"

import { isSessionNotFreshError } from "@better-auth-ui/core"
import type {
  AddPasskeyParams,
  PasskeyAuthClient
} from "@better-auth-ui/core/plugins/passkey"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useAddPasskey } from "@better-auth-ui/react/plugins/passkey"
import { Fingerprint } from "lucide-react"
import { type SyntheticEvent, useRef } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
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

export type AddPasskeyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPasskeyDialog({
  open,
  onOpenChange
}: AddPasskeyDialogProps) {
  const { authClient, localization } = useAuth<PasskeyAuthClient>()
  const { authenticatorAttachment, localization: passkeyLocalization } =
    useAuthPlugin(passkeyPlugin)

  const addPasskey = useAddPasskey(authClient)
  const pendingRequest = useRef<AddPasskeyParams<PasskeyAuthClient>>(undefined)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      addPasskey.reset()
      pendingRequest.current = undefined
    }
    onOpenChange(nextOpen)
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {needsFreshSession ? (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">
                {localization.settings.freshSessionTitle}
              </DialogTitle>
            </DialogHeader>
            <FreshSessionPrompt
              onFresh={() => {
                const request = pendingRequest.current
                if (request) submitRequest(request)
              }}
            />
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Fingerprint />
                {passkeyLocalization.addPasskey}
              </DialogTitle>

              <DialogDescription>
                {passkeyLocalization.passkeysDescription}
              </DialogDescription>
            </DialogHeader>

            <Field data-invalid={addPasskey.isError}>
              <FieldLabel htmlFor="passkey-name">
                {passkeyLocalization.name}
              </FieldLabel>

              <Input
                id="passkey-name"
                name="name"
                autoFocus
                placeholder={localization.settings.optional}
                disabled={addPasskey.isPending}
                aria-invalid={addPasskey.isError}
              />

              {addPasskey.error && (
                <FieldError>
                  {addPasskey.error.error?.message ?? addPasskey.error.message}
                </FieldError>
              )}
            </Field>

            <DialogFooter>
              <DialogClose
                className={buttonVariants({ variant: "outline" })}
                disabled={addPasskey.isPending}
                type="button"
              >
                {localization.settings.cancel}
              </DialogClose>

              <Button type="submit" disabled={addPasskey.isPending}>
                {addPasskey.isPending && <Spinner />}

                {passkeyLocalization.addPasskey}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
