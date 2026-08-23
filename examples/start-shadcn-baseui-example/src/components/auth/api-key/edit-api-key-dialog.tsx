"use client"

import type {
  ApiKeyAuthClient,
  ListedApiKey
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useUpdateApiKey } from "@better-auth-ui/react/plugins/api-key"
import { type FormEvent, useEffect, useRef, useState } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"

const optionalNumber = (formData: FormData, name: string) => {
  const value = String(formData.get(name) ?? "").trim()
  return value ? Number(value) : undefined
}

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
  const [enabled, setEnabled] = useState(apiKey.enabled)
  const [rateLimitEnabled, setRateLimitEnabled] = useState(
    apiKey.rateLimitEnabled
  )
  const [formError, setFormError] = useState<string>()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!open) return

    formRef.current?.reset()
    setEnabled(apiKey.enabled)
    setRateLimitEnabled(apiKey.rateLimitEnabled)
    setFormError(undefined)
  }, [apiKey, open])

  const updateApiKey = useUpdateApiKey(authClient, {
    onSuccess: () => onOpenChange(false)
  })
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    try {
      const metadata = String(formData.get("metadata") ?? "").trim()
      const permissions = String(formData.get("permissions") ?? "").trim()
      setFormError(undefined)
      updateApiKey.mutate({
        keyId: apiKey.id,
        configId: apiKey.configId,
        name: String(formData.get("name") ?? "").trim(),
        enabled,
        rateLimitEnabled,
        remaining: optionalNumber(formData, "remaining"),
        refillAmount: optionalNumber(formData, "refillAmount"),
        refillInterval: optionalNumber(formData, "refillInterval"),
        rateLimitMax: optionalNumber(formData, "rateLimitMax"),
        rateLimitTimeWindow: optionalNumber(formData, "rateLimitTimeWindow"),
        metadata: metadata ? JSON.parse(metadata) : null,
        permissions: permissions ? JSON.parse(permissions) : null
      })
    } catch {
      setFormError("Metadata and permissions must contain valid JSON.")
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form className="flex flex-col gap-6" onSubmit={submit} ref={formRef}>
          <DialogHeader>
            <DialogTitle>{labels.editApiKey}</DialogTitle>
          </DialogHeader>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor={`api-key-name-${apiKey.id}`}>
                {labels.name}
              </FieldLabel>
              <Input
                id={`api-key-name-${apiKey.id}`}
                name="name"
                defaultValue={apiKey.name ?? ""}
              />
            </Field>
            <Field orientation="horizontal">
              <Switch
                id={`api-key-enabled-${apiKey.id}`}
                checked={enabled}
                onCheckedChange={setEnabled}
              />
              <FieldLabel htmlFor={`api-key-enabled-${apiKey.id}`}>
                {labels.enabled}
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Switch
                id={`api-key-rate-limit-${apiKey.id}`}
                checked={rateLimitEnabled}
                onCheckedChange={setRateLimitEnabled}
              />
              <FieldLabel htmlFor={`api-key-rate-limit-${apiKey.id}`}>
                {labels.rateLimit}
              </FieldLabel>
            </Field>
            <NumericField
              name="remaining"
              label={labels.remaining}
              value={apiKey.remaining}
            />
            <NumericField
              name="refillAmount"
              label={labels.refillAmount}
              value={apiKey.refillAmount}
            />
            <NumericField
              name="refillInterval"
              label={labels.refillInterval}
              value={apiKey.refillInterval}
            />
            <NumericField
              name="rateLimitMax"
              label={labels.rateLimitMax}
              value={apiKey.rateLimitMax}
            />
            <NumericField
              name="rateLimitTimeWindow"
              label={labels.rateLimitWindow}
              value={apiKey.rateLimitTimeWindow}
            />
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor={`api-key-metadata-${apiKey.id}`}>
                {labels.metadata}
              </FieldLabel>
              <Textarea
                id={`api-key-metadata-${apiKey.id}`}
                name="metadata"
                defaultValue={
                  apiKey.metadata
                    ? JSON.stringify(apiKey.metadata, null, 2)
                    : ""
                }
              />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor={`api-key-permissions-${apiKey.id}`}>
                {labels.permissions}
              </FieldLabel>
              <Textarea
                id={`api-key-permissions-${apiKey.id}`}
                name="permissions"
                defaultValue={
                  apiKey.permissions
                    ? JSON.stringify(apiKey.permissions, null, 2)
                    : ""
                }
              />
            </Field>
            {(formError || updateApiKey.error) && (
              <FieldError className="sm:col-span-2">
                {formError ??
                  updateApiKey.error?.error?.message ??
                  updateApiKey.error?.message}
              </FieldError>
            )}
          </FieldGroup>
          <DialogFooter>
            <DialogClose className={buttonVariants({ variant: "outline" })}>
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

function NumericField({
  name,
  label,
  value
}: {
  name: string
  label: string
  value: number | null
}) {
  return (
    <Field>
      <FieldLabel htmlFor={`api-key-${name}`}>{label}</FieldLabel>
      <Input
        id={`api-key-${name}`}
        name={name}
        type="number"
        min={0}
        defaultValue={value ?? undefined}
      />
    </Field>
  )
}
