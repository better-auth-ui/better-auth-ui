import { apiKeyLocalization } from "@better-auth-ui/core/plugins"
import {
  type ApiKeyAuthClient,
  deleteApiKeyOptions,
  useAuth
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { Key } from "lucide-solid"
import type { ListedApiKey } from "@/components/auth/settings/shared/types"
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function DeleteApiKeyDialog(props: {
  apiKey: ListedApiKey
  organizationId?: string
  onOpenChange: (open: boolean) => void
}) {
  const auth = useAuth()
  const preview = () => `${props.apiKey.start}${"*".repeat(16)}`
  const previewId = () => `delete-api-key-preview-${props.apiKey.id}`
  const deleteApiKey = createMutation(() => ({
    ...deleteApiKeyOptions(auth.authClient as ApiKeyAuthClient),
    onSuccess: () => props.onOpenChange(false)
  }))

  const deleteKey = () => {
    deleteApiKey.mutate({
      keyId: props.apiKey.id,
      ...(props.organizationId ? { configId: "organization" } : {})
    } as Parameters<typeof deleteApiKey.mutate>[0])
  }

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogMedia>
          <Key />
        </AlertDialogMedia>
        <AlertDialogTitle>{apiKeyLocalization.deleteApiKey}</AlertDialogTitle>
        <AlertDialogDescription>
          {apiKeyLocalization.deleteApiKeyWarning}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <Field>
        <FieldLabel for={previewId()}>
          {props.apiKey.name || apiKeyLocalization.apiKey}
        </FieldLabel>
        <Input
          class="font-mono text-xs"
          disabled
          id={previewId()}
          readonly
          value={preview()}
        />
      </Field>

      <AlertDialogFooter>
        <AlertDialogCancel disabled={deleteApiKey.isPending} type="button">
          {auth.localization.settings.cancel}
        </AlertDialogCancel>
        <Button
          disabled={deleteApiKey.isPending}
          onClick={deleteKey}
          type="button"
          variant="destructive"
        >
          {deleteApiKey.isPending
            ? `${apiKeyLocalization.deleteApiKey}…`
            : apiKeyLocalization.deleteApiKey}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}
