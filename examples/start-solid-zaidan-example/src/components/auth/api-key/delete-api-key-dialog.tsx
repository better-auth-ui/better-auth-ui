import { apiKeyLocalization } from "@better-auth-ui/core/plugins/api-key"
import {
  type ApiKeyAuthClient,
  useAuth,
  useDeleteApiKey
} from "@better-auth-ui/solid"
import { Key } from "lucide-solid"
import type { ListedApiKey } from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DeleteApiKeyDialog(props: {
  apiKey: ListedApiKey
  organizationId?: string
  onOpenChange: (open: boolean) => void
}) {
  const auth = useAuth<ApiKeyAuthClient>()
  const preview = () => `${props.apiKey.start}${"*".repeat(16)}`
  const previewId = () => `delete-api-key-preview-${props.apiKey.id}`
  const deleteApiKey = useDeleteApiKey(auth.authClient, {
    onSuccess: () => props.onOpenChange(false)
  })

  const deleteKey = () => {
    deleteApiKey.mutate({
      keyId: props.apiKey.id,
      ...(props.organizationId ? { configId: "organization" } : {})
    } as Parameters<typeof deleteApiKey.mutate>[0])
  }

  return (
    <DialogContent>
      <DialogHeader>
        <div class="flex size-10 items-center justify-center rounded-md bg-muted">
          <Key class="size-4.5" />
        </div>
        <DialogTitle>{apiKeyLocalization.deleteApiKey}</DialogTitle>
        <DialogDescription>
          {apiKeyLocalization.deleteApiKeyWarning}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-2">
        <Label for={previewId()}>
          {props.apiKey.name || apiKeyLocalization.apiKey}
        </Label>
        <Input
          class="font-mono text-xs"
          disabled
          id={previewId()}
          readonly
          value={preview()}
        />
      </div>

      <DialogFooter>
        <DialogClose
          as={Button}
          disabled={deleteApiKey.isPending}
          type="button"
          variant="outline"
        >
          {auth.localization.settings.cancel}
        </DialogClose>
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
      </DialogFooter>
    </DialogContent>
  )
}
