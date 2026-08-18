import {
  type ApiKeyAuthClient,
  apiKeyExpirationDaysToSeconds
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useCreateApiKey } from "@better-auth-ui/solid/plugins/api-key"
import { Key } from "lucide-solid"
import { createSignal, For, Show } from "solid-js"
import { NewApiKeyDialog } from "@/components/auth/api-key/new-api-key-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"

type ExpirationOption = {
  id: string
  label: string
  days: number | null
}

type ConfigurationOption = { id: string; label: string }

export function CreateApiKeyDialog(props: {
  organizationId?: string
  onOpenChange: (open: boolean) => void
}) {
  const auth = useAuth<ApiKeyAuthClient>()
  const {
    configurations,
    keyExpiration,
    localization: apiKeyLocalization,
    permissions
  } = useAuthPlugin(apiKeyPlugin)
  const configurationOptions: ConfigurationOption[] = configurations
    .filter(
      (configuration) =>
        configuration.organization === Boolean(props.organizationId)
    )
    .map((configuration) => ({
      id: configuration.id,
      label: configuration.label
    }))
  const expirationOptions: ExpirationOption[] = keyExpiration
    ? [
        ...keyExpiration.intervals.map((days) => ({
          id: String(days),
          label: `${days.toLocaleString()} ${
            days === 1 ? apiKeyLocalization.day : apiKeyLocalization.days
          }`,
          days
        })),
        ...(keyExpiration.allowNever
          ? [
              {
                id: "never",
                label: apiKeyLocalization.never,
                days: null
              }
            ]
          : [])
      ]
    : []
  const defaultExpirationInterval = keyExpiration
    ? keyExpiration.defaultInterval
    : undefined
  const [expiration, setExpiration] = createSignal(
    expirationOptions.find(
      (option) => option.days === defaultExpirationInterval
    )
  )
  const [configuration, setConfiguration] = createSignal<
    ConfigurationOption | undefined
  >(configurationOptions[0])
  const [rateLimitEnabled, setRateLimitEnabled] = createSignal(false)
  const [formError, setFormError] = createSignal<string>()
  const [isNewKeyDialogOpen, setIsNewKeyDialogOpen] = createSignal(false)
  const [newApiKeyName, setNewApiKeyName] = createSignal<string | null>(null)
  const [newApiKeySecret, setNewApiKeySecret] = createSignal<string | null>(
    null
  )
  const createApiKey = useCreateApiKey(auth.authClient, () => ({
    onSuccess: (apiKey) => {
      props.onOpenChange(false)
      setNewApiKeyName(apiKey.name ?? null)
      setNewApiKeySecret(apiKey.key)
      setIsNewKeyDialogOpen(true)
    }
  }))

  const handleNewKeyDialogOpenChange = (open: boolean) => {
    setIsNewKeyDialogOpen(open)

    if (!open) {
      setNewApiKeyName(null)
      setNewApiKeySecret(null)
    }
  }

  const submitCreateApiKey = (event: SubmitEvent) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const name = String(formData.get("name") ?? "").trim()
    const expirationDays = expiration()?.days
    const expiresIn = expirationDays
      ? apiKeyExpirationDaysToSeconds(expirationDays)
      : undefined
    const numberValue = (field: string) => {
      const value = String(formData.get(field) ?? "").trim()
      return value ? Number(value) : undefined
    }
    const selectedPermissions = Object.fromEntries(
      permissions
        .map((permission) => {
          const actions = permission.actions
            .map((action) => (typeof action === "string" ? action : action.id))
            .filter((action) =>
              formData.has(`permission:${permission.resource}:${action}`)
            )
          return [permission.resource, actions] as const
        })
        .filter(([, actions]) => actions.length)
    )
    let metadata: unknown
    try {
      const metadataText = String(formData.get("metadata") ?? "").trim()
      metadata = metadataText ? JSON.parse(metadataText) : undefined
      setFormError(undefined)
    } catch {
      setFormError("Metadata must contain valid JSON.")
      return
    }
    const configId =
      configuration()?.id || (props.organizationId ? "organization" : undefined)
    const payload = {
      ...(name ? { name } : {}),
      ...(expiresIn ? { expiresIn } : {}),
      ...(configId ? { configId } : {}),
      ...(props.organizationId ? { organizationId: props.organizationId } : {}),
      ...(metadata ? { metadata } : {}),
      ...(Object.keys(selectedPermissions).length
        ? { permissions: selectedPermissions }
        : {}),
      remaining: numberValue("remaining"),
      refillAmount: numberValue("refillAmount"),
      refillInterval: numberValue("refillInterval"),
      rateLimitEnabled: rateLimitEnabled(),
      rateLimitMax: numberValue("rateLimitMax"),
      rateLimitTimeWindow: numberValue("rateLimitTimeWindow")
    }

    createApiKey.mutate(
      (Object.keys(payload).length > 0 ? payload : undefined) as Parameters<
        typeof createApiKey.mutate
      >[0]
    )
  }

  return (
    <>
      <DialogContent>
        <form class="flex flex-col gap-6" onSubmit={submitCreateApiKey}>
          <DialogHeader>
            <div class="flex size-10 items-center justify-center rounded-md bg-muted">
              <Key class="size-4.5" />
            </div>
            <DialogTitle>{apiKeyLocalization.createApiKey}</DialogTitle>
            <DialogDescription>
              {apiKeyLocalization.apiKeysDescription}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel for="api-key-name">
                {apiKeyLocalization.name}
              </FieldLabel>
              <Input
                autofocus
                disabled={createApiKey.isPending}
                id="api-key-name"
                name="name"
                placeholder={auth.localization.settings.optional}
              />
            </Field>

            <Show when={configurationOptions.length > 0}>
              <Field>
                <FieldLabel for="api-key-configuration">
                  {apiKeyLocalization.configuration}
                </FieldLabel>
                <Select<ConfigurationOption>
                  disabled={createApiKey.isPending}
                  itemComponent={(itemProps) => (
                    <SelectItem item={itemProps.item}>
                      {itemProps.item.rawValue.label}
                    </SelectItem>
                  )}
                  onChange={(option) => setConfiguration(option ?? undefined)}
                  options={configurationOptions}
                  optionTextValue="label"
                  optionValue="id"
                  value={configuration()}
                >
                  <SelectTrigger id="api-key-configuration" class="w-full">
                    <SelectValue<ConfigurationOption>>
                      {(state) =>
                        (
                          state.selectedOption() as
                            | ConfigurationOption
                            | undefined
                        )?.label
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent />
                </Select>
              </Field>
            </Show>

            <Show when={keyExpiration}>
              <Field>
                <FieldLabel for="api-key-expiration">
                  {apiKeyLocalization.expiration}
                </FieldLabel>
                <Select<ExpirationOption>
                  disabled={createApiKey.isPending}
                  itemComponent={(itemProps) => (
                    <SelectItem item={itemProps.item}>
                      {itemProps.item.rawValue.label}
                    </SelectItem>
                  )}
                  onChange={(option) => setExpiration(option ?? undefined)}
                  options={expirationOptions}
                  optionTextValue="label"
                  optionValue="id"
                  value={expiration()}
                >
                  <SelectTrigger id="api-key-expiration" class="w-full">
                    <SelectValue<ExpirationOption>>
                      {(state) => state.selectedOption().label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent />
                </Select>
              </Field>
            </Show>

            <div class="grid gap-4 sm:grid-cols-2">
              <NumberField name="remaining" label={apiKeyLocalization.quota} />
              <NumberField
                name="refillAmount"
                label={apiKeyLocalization.refillAmount}
              />
              <NumberField
                name="refillInterval"
                label={apiKeyLocalization.refillInterval}
              />
              <Field orientation="horizontal">
                <Switch
                  checked={rateLimitEnabled()}
                  onChange={setRateLimitEnabled}
                />
                <FieldLabel>{apiKeyLocalization.rateLimit}</FieldLabel>
              </Field>
              <NumberField
                name="rateLimitMax"
                label={apiKeyLocalization.rateLimitMax}
              />
              <NumberField
                name="rateLimitTimeWindow"
                label={apiKeyLocalization.rateLimitWindow}
              />
            </div>

            <For each={permissions}>
              {(permission) => (
                <Field>
                  <FieldLabel>
                    {permission.label ?? permission.resource}
                  </FieldLabel>
                  <div class="flex flex-wrap gap-3">
                    <For each={permission.actions}>
                      {(action) => {
                        const id =
                          typeof action === "string" ? action : action.id
                        return (
                          <label class="flex items-center gap-2 text-sm">
                            <input
                              name={`permission:${permission.resource}:${id}`}
                              type="checkbox"
                            />
                            {typeof action === "string" ? action : action.label}
                          </label>
                        )
                      }}
                    </For>
                  </div>
                </Field>
              )}
            </For>

            <Field>
              <FieldLabel for="api-key-metadata">
                {apiKeyLocalization.metadata}
              </FieldLabel>
              <Textarea id="api-key-metadata" name="metadata" rows={3} />
              <Show when={formError()}>
                <p class="text-sm text-destructive" role="alert">
                  {formError()}
                </p>
              </Show>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose
              as={Button}
              disabled={createApiKey.isPending}
              type="button"
              variant="outline"
            >
              {auth.localization.settings.cancel}
            </DialogClose>
            <Button disabled={createApiKey.isPending} type="submit">
              {createApiKey.isPending
                ? `${apiKeyLocalization.createApiKey}…`
                : apiKeyLocalization.createApiKey}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <Dialog
        open={isNewKeyDialogOpen()}
        onOpenChange={handleNewKeyDialogOpenChange}
      >
        <NewApiKeyDialog
          name={newApiKeyName()}
          onDismiss={() => handleNewKeyDialogOpenChange(false)}
          open={isNewKeyDialogOpen()}
          secretKey={newApiKeySecret()}
        />
      </Dialog>
    </>
  )
}

function NumberField(props: { name: string; label: string }) {
  return (
    <Field>
      <FieldLabel for={`api-key-${props.name}`}>{props.label}</FieldLabel>
      <Input
        id={`api-key-${props.name}`}
        name={props.name}
        type="number"
        min="0"
      />
    </Field>
  )
}
