import { apiKeyLocalization } from "@better-auth-ui/core/plugins/api-key"
import { useAuth } from "@better-auth-ui/solid"
import { Key, X } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import { DeleteApiKeyDialog } from "@/components/auth/api-key/delete-api-key-dialog"
import type { ListedApiKey } from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

export function ApiKey(props: {
  apiKey: ListedApiKey
  organizationId?: string
  hideDelete?: boolean
}) {
  const auth = useAuth()
  const [deleteOpen, setDeleteOpen] = createSignal(false)
  const preview = () => `${props.apiKey.start}${"*".repeat(16)}`

  return (
    <div class="flex items-center gap-3 p-6">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
        <Key class="size-4.5" />
      </div>

      <div class="flex min-w-0 flex-col">
        <span class="truncate font-medium text-sm leading-tight">
          {props.apiKey.name || apiKeyLocalization.apiKey}
        </span>
        <span class="truncate font-mono text-muted-foreground text-xs">
          {preview()}
        </span>
        <span class="text-muted-foreground text-xs">
          {new Date(props.apiKey.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })}
        </span>
      </div>

      <Show when={!props.hideDelete}>
        <Dialog open={deleteOpen()} onOpenChange={setDeleteOpen}>
          <DialogTrigger
            as={Button}
            aria-label={apiKeyLocalization.deleteApiKey}
            class="ml-auto shrink-0"
            size="sm"
            variant="outline"
          >
            <X />
            {auth.localization.settings.delete}
          </DialogTrigger>
          <DeleteApiKeyDialog
            apiKey={props.apiKey}
            organizationId={props.organizationId}
            onOpenChange={setDeleteOpen}
          />
        </Dialog>
      </Show>
    </div>
  )
}
