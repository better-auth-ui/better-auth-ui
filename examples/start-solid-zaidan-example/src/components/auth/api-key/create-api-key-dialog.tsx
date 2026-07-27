import type { ApiKeyAuthClient } from "@better-auth-ui/core/plugins/api-key"
import { apiKeyLocalization } from "@better-auth-ui/core/plugins/api-key"
import { useAuth } from "@better-auth-ui/solid"
import { useCreateApiKey } from "@better-auth-ui/solid/plugins/api-key"
import { Key } from "lucide-solid"
import { createSignal } from "solid-js"
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
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function CreateApiKeyDialog(props: {
  organizationId?: string
  onOpenChange: (open: boolean) => void
}) {
  const auth = useAuth<ApiKeyAuthClient>()
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
    const payload = {
      ...(name ? { name } : {}),
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
