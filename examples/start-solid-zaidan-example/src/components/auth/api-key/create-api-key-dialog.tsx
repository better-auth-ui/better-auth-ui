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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"

type ExpirationOption = {
  id: string
  label: string
  days: number | null
}

export function CreateApiKeyDialog(props: {
  organizationId?: string
  onOpenChange: (open: boolean) => void
}) {
  const auth = useAuth<ApiKeyAuthClient>()
  const { keyExpiration, localization: apiKeyLocalization } =
    useAuthPlugin(apiKeyPlugin)
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
    const payload = {
      ...(name ? { name } : {}),
      ...(expiresIn ? { expiresIn } : {}),
      ...(props.organizationId
        ? { organizationId: props.organizationId, configId: "organization" }
        : {})
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
