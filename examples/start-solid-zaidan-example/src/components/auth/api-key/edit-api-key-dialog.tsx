import {
  type ApiKeyAuthClient,
  apiKeyQueryKeys
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/solid"
import { useUpdateApiKey } from "@better-auth-ui/solid/plugins/api-key"
import { useMutation, useQueryClient } from "@tanstack/solid-query"
import { createEffect, createSignal, Show } from "solid-js"
import type { ListedApiKey } from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import {
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
import type { UpdateApiKeyInput } from "@/lib/auth/update-api-key"

const optionalNumber = (formData: FormData, name: string) => {
  const value = String(formData.get(name) ?? "").trim()
  return value ? Number(value) : undefined
}

export function EditApiKeyDialog(props: {
  apiKey: ListedApiKey
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const auth = useAuth<ApiKeyAuthClient>()
  const config = useAuthPlugin(apiKeyPlugin)
  const labels = config.localization
  const session = useSession(auth.authClient)
  const queryClient = useQueryClient()
  const [enabled, setEnabled] = createSignal(props.apiKey.enabled)
  const [rateLimitEnabled, setRateLimitEnabled] = createSignal(
    props.apiKey.rateLimitEnabled
  )
  const [formError, setFormError] = createSignal<string>()
  createEffect(() => {
    if (!props.open) return

    setEnabled(props.apiKey.enabled)
    setRateLimitEnabled(props.apiKey.rateLimitEnabled)
    setFormError(undefined)
  })

  const updateApiKeyClient = useUpdateApiKey(auth.authClient, () => ({
    onSuccess: () => props.onOpenChange(false)
  }))
  const updateApiKeyOnServer = useMutation(() => ({
    mutationFn: async (input: UpdateApiKeyInput) => {
      if (!config.updateApiKey) throw new Error("Server updates are disabled.")
      return config.updateApiKey(input)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: apiKeyQueryKeys.lists(session.data?.user.id)
      })
      props.onOpenChange(false)
    }
  }))
  const submit = (event: SubmitEvent) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget as HTMLFormElement)
    try {
      const baseUpdate = {
        keyId: props.apiKey.id,
        configId: props.apiKey.configId,
        name: String(formData.get("name") ?? "").trim()
      }

      if (!config.updateApiKey) {
        setFormError(undefined)
        updateApiKeyClient.mutate(baseUpdate)
        return
      }

      const metadata = String(formData.get("metadata") ?? "").trim()
      const permissions = String(formData.get("permissions") ?? "").trim()
      setFormError(undefined)
      updateApiKeyOnServer.mutate({
        ...baseUpdate,
        enabled: enabled(),
        rateLimitEnabled: rateLimitEnabled(),
        remaining: optionalNumber(formData, "remaining"),
        refillAmount: optionalNumber(formData, "refillAmount"),
        refillInterval: optionalNumber(formData, "refillInterval"),
        rateLimitMax: optionalNumber(formData, "rateLimitMax"),
        rateLimitTimeWindow: optionalNumber(formData, "rateLimitTimeWindow"),
        metadata: metadata ? JSON.parse(metadata) : null,
        permissions: permissions
          ? (JSON.parse(permissions) as Record<string, string[]>)
          : null
      })
    } catch {
      setFormError("Metadata and permissions must contain valid JSON.")
    }
  }
  const isPending = () =>
    updateApiKeyClient.isPending || updateApiKeyOnServer.isPending
  const updateErrorMessage = () =>
    updateApiKeyOnServer.error?.message ??
    updateApiKeyClient.error?.error?.message ??
    updateApiKeyClient.error?.message
  return (
    <DialogContent class="sm:max-w-xl">
      <form class="flex flex-col gap-6" onSubmit={submit}>
        <DialogHeader>
          <DialogTitle>{labels.editApiKey}</DialogTitle>
        </DialogHeader>
        <FieldGroup class="grid gap-4 sm:grid-cols-2">
          <Field class="sm:col-span-2">
            <FieldLabel for={`api-key-name-${props.apiKey.id}`}>
              {labels.name}
            </FieldLabel>
            <Input
              id={`api-key-name-${props.apiKey.id}`}
              name="name"
              value={props.apiKey.name ?? ""}
            />
          </Field>
          <Show when={config.updateApiKey}>
            <Field orientation="horizontal">
              <Switch checked={enabled()} onChange={setEnabled} />
              <FieldLabel>{labels.enabled}</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Switch
                checked={rateLimitEnabled()}
                onChange={setRateLimitEnabled}
              />
              <FieldLabel>{labels.rateLimit}</FieldLabel>
            </Field>
            <NumericField
              name="remaining"
              label={labels.remaining}
              value={props.apiKey.remaining}
            />
            <NumericField
              name="refillAmount"
              label={labels.refillAmount}
              value={props.apiKey.refillAmount}
            />
            <NumericField
              name="refillInterval"
              label={labels.refillInterval}
              value={props.apiKey.refillInterval}
            />
            <NumericField
              name="rateLimitMax"
              label={labels.rateLimitMax}
              value={props.apiKey.rateLimitMax}
            />
            <NumericField
              name="rateLimitTimeWindow"
              label={labels.rateLimitWindow}
              value={props.apiKey.rateLimitTimeWindow}
            />
            <Field class="sm:col-span-2">
              <FieldLabel>{labels.metadata}</FieldLabel>
              <Textarea
                name="metadata"
                value={
                  props.apiKey.metadata
                    ? JSON.stringify(props.apiKey.metadata, null, 2)
                    : ""
                }
              />
            </Field>
            <Field class="sm:col-span-2">
              <FieldLabel>{labels.permissions}</FieldLabel>
              <Textarea
                name="permissions"
                value={
                  props.apiKey.permissions
                    ? JSON.stringify(props.apiKey.permissions, null, 2)
                    : ""
                }
              />
            </Field>
          </Show>
          <Show when={formError() || updateErrorMessage()}>
            <FieldError class="sm:col-span-2">
              {formError() ?? updateErrorMessage()}
            </FieldError>
          </Show>
        </FieldGroup>
        <DialogFooter>
          <DialogClose as={Button} variant="outline">
            {auth.localization.settings.cancel}
          </DialogClose>
          <Button disabled={isPending()} type="submit">
            {auth.localization.settings.saveChanges}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

function NumericField(props: {
  name: string
  label: string
  value: number | null
}) {
  return (
    <Field>
      <FieldLabel for={`api-key-${props.name}`}>{props.label}</FieldLabel>
      <Input
        id={`api-key-${props.name}`}
        name={props.name}
        type="number"
        min="0"
        value={props.value ?? undefined}
      />
    </Field>
  )
}
