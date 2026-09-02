import {
  type ApiKeyAuthClient,
  apiKeyExpirationDaysToSeconds
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useCreateApiKey } from "@better-auth-ui/solid/plugins/api-key"
import { Key } from "lucide-solid"
import { createSignal, Show } from "solid-js"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
import { createAuthForm } from "../auth-form"

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
    localization: apiKeyLocalization
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

  const form = createAuthForm(() => ({
    defaultValues: { name: "" },
    onSubmit: async ({ value }) => {
      const name = value.name.trim()
      const expirationDays = expiration()?.days
      const expiresIn = expirationDays
        ? apiKeyExpirationDaysToSeconds(expirationDays)
        : undefined
      const configId =
        configuration()?.id ||
        (props.organizationId ? "organization" : undefined)
      const payload = {
        ...(name ? { name } : {}),
        ...(expiresIn ? { expiresIn } : {}),
        ...(configId ? { configId } : {}),
        ...(props.organizationId
          ? { organizationId: props.organizationId }
          : {})
      }
      await createApiKey.mutateAsync(
        Object.keys(payload).length > 0 ? payload : undefined
      )
    }
  }))

  return (
    <>
      <DialogContent>
        <form.AppForm>
          <form.AuthFormRoot class="flex flex-col gap-6">
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
              <form.AppField name="name">
                {(field) => (
                  <field.AuthFormTextField
                    autofocus
                    disabled={createApiKey.isPending}
                    id="api-key-name"
                    label={apiKeyLocalization.name}
                    placeholder={auth.localization.settings.optional}
                  />
                )}
              </form.AppField>

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
              <form.AuthFormServerError />
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
              <form.AuthFormSubmitButton disabled={createApiKey.isPending}>
                {apiKeyLocalization.createApiKey}
              </form.AuthFormSubmitButton>
            </DialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
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
