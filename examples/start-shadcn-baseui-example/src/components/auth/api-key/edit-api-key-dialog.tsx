"use client"

import type {
  ApiKeyAuthClient,
  ListedApiKey
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useUpdateApiKey } from "@better-auth-ui/react/plugins/api-key"
import type { FormEvent } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"

export function EditApiKeyDialog({
  apiKey,
  open,
  onOpenChange
}: {
  apiKey: ListedApiKey
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { authClient, localization } = useAuth<ApiKeyAuthClient>()
  const { localization: labels } = useAuthPlugin(apiKeyPlugin)

  const updateApiKey = useUpdateApiKey(authClient, {
    onSuccess: () => onOpenChange(false)
  })
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    updateApiKey.mutate({
      keyId: apiKey.id,
      configId: apiKey.configId,
      name: String(formData.get("name") ?? "").trim()
    })
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form className="flex flex-col gap-6" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{labels.editApiKey}</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`api-key-name-${apiKey.id}`}>
                {labels.name}
              </FieldLabel>
              <Input
                id={`api-key-name-${apiKey.id}`}
                name="name"
                defaultValue={apiKey.name ?? ""}
              />
            </Field>
            {updateApiKey.error && (
              <FieldError>
                {updateApiKey.error.error?.message ??
                  updateApiKey.error.message}
              </FieldError>
            )}
          </FieldGroup>
          <DialogFooter>
            <DialogClose
              className={buttonVariants({ variant: "outline" })}
              type="button"
            >
              {localization.settings.cancel}
            </DialogClose>
            <Button disabled={updateApiKey.isPending} type="submit">
              {updateApiKey.isPending && <Spinner />}
              {localization.settings.saveChanges}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
