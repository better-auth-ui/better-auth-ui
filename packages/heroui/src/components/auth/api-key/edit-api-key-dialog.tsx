import type {
  ApiKeyAuthClient,
  ListedApiKey
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useUpdateApiKey } from "@better-auth-ui/react/plugins/api-key"
import {
  AlertDialog,
  Button,
  Form,
  Input,
  Label,
  Spinner,
  Switch,
  TextArea,
  TextField
} from "@heroui/react"
import { type FormEvent, useEffect, useRef, useState } from "react"
import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"

const optionalNumber = (formData: FormData, name: string) => {
  const value = formData.get(name)
  return typeof value === "string" && value.trim() ? Number(value) : undefined
}

export function EditApiKeyDialog({
  apiKey,
  isOpen,
  onOpenChange
}: {
  apiKey: ListedApiKey
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { authClient, localization } = useAuth()
  const { localization: labels } = useAuthPlugin(apiKeyPlugin)
  const [enabled, setEnabled] = useState(apiKey.enabled)
  const [rateLimitEnabled, setRateLimitEnabled] = useState(
    apiKey.rateLimitEnabled
  )
  const [formError, setFormError] = useState<string>()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!isOpen) return

    formRef.current?.reset()
    setEnabled(apiKey.enabled)
    setRateLimitEnabled(apiKey.rateLimitEnabled)
    setFormError(undefined)
  }, [apiKey, isOpen])

  const updateApiKey = useUpdateApiKey(authClient as ApiKeyAuthClient, {
    onSuccess: () => onOpenChange(false)
  })

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(undefined)
    const formData = new FormData(event.currentTarget)
    try {
      const metadataText = String(formData.get("metadata") ?? "").trim()
      const permissionsText = String(formData.get("permissions") ?? "").trim()
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
        metadata: metadataText ? JSON.parse(metadataText) : null,
        permissions: permissionsText ? JSON.parse(permissionsText) : null
      })
    } catch {
      setFormError("Metadata and permissions must contain valid JSON.")
    }
  }

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="max-w-xl">
          <Form onSubmit={submit} ref={formRef}>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Heading>{labels.editApiKey}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body className="overflow-visible">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField className="sm:col-span-2" name="name">
                  <Label>{labels.name}</Label>
                  <Input defaultValue={apiKey.name ?? ""} variant="secondary" />
                </TextField>
                <Switch isSelected={enabled} onChange={setEnabled}>
                  {labels.enabled}
                </Switch>
                <Switch
                  isSelected={rateLimitEnabled}
                  onChange={setRateLimitEnabled}
                >
                  {labels.rateLimit}
                </Switch>
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
                <TextField className="sm:col-span-2" name="metadata">
                  <Label>{labels.metadata}</Label>
                  <TextArea
                    defaultValue={
                      apiKey.metadata
                        ? JSON.stringify(apiKey.metadata, null, 2)
                        : ""
                    }
                    rows={3}
                    variant="secondary"
                  />
                </TextField>
                <TextField className="sm:col-span-2" name="permissions">
                  <Label>{labels.permissions}</Label>
                  <TextArea
                    defaultValue={
                      apiKey.permissions
                        ? JSON.stringify(apiKey.permissions, null, 2)
                        : ""
                    }
                    rows={3}
                    variant="secondary"
                  />
                </TextField>
              </div>
              {(formError || updateApiKey.error) && (
                <p className="mt-3 text-sm text-danger" role="alert">
                  {formError ??
                    updateApiKey.error?.error?.message ??
                    updateApiKey.error?.message}
                </p>
              )}
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                {localization.settings.cancel}
              </Button>
              <Button isPending={updateApiKey.isPending} type="submit">
                {updateApiKey.isPending && (
                  <Spinner color="current" size="sm" />
                )}
                {localization.settings.saveChanges}
              </Button>
            </AlertDialog.Footer>
          </Form>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
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
    <TextField name={name} type="number">
      <Label>{label}</Label>
      <Input defaultValue={value ?? undefined} min={0} variant="secondary" />
    </TextField>
  )
}
