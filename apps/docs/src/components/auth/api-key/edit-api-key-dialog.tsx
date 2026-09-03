"use client"

import type {
  ApiKeyAuthClient,
  ListedApiKey
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useUpdateApiKey } from "@better-auth-ui/react/plugins/api-key"
import { useEffect } from "react"
import { buttonVariants } from "@/components/ui/button"
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
import { useAuthForm } from "../auth-form"

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
  const form = useAuthForm({
    defaultValues: { name: apiKey.name ?? "" },
    onSubmit: async ({ value }) =>
      await updateApiKey.mutateAsync({
        configId: apiKey.configId,
        keyId: apiKey.id,
        name: value.name.trim()
      })
  })
  useEffect(() => {
    if (open) form.reset({ name: apiKey.name ?? "" })
  }, [apiKey.name, form, open])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form.AppForm>
          <form.AuthFormRoot className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle>{labels.editApiKey}</DialogTitle>
            </DialogHeader>
            <FieldGroup>
              <form.AppField name="name">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={`api-key-name-${apiKey.id}`}>
                      {labels.name}
                    </FieldLabel>
                    <Input
                      id={`api-key-name-${apiKey.id}`}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                    />
                  </Field>
                )}
              </form.AppField>
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
              <form.AuthFormSubmitButton disabled={updateApiKey.isPending}>
                {updateApiKey.isPending && <Spinner />}
                {localization.settings.saveChanges}
              </form.AuthFormSubmitButton>
            </DialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}
