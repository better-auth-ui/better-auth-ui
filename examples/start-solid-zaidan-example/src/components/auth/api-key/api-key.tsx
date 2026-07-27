import { apiKeyLocalization } from "@better-auth-ui/core/plugins"
import { useAuth } from "@better-auth-ui/solid"
import { Key, X } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import { DeleteApiKeyDialog } from "@/components/auth/api-key/delete-api-key-dialog"
import type { ListedApiKey } from "@/components/auth/settings/shared/types"
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"

export function ApiKey(props: {
  apiKey: ListedApiKey
  organizationId?: string
  hideDelete?: boolean
}) {
  const auth = useAuth()
  const [deleteOpen, setDeleteOpen] = createSignal(false)
  const preview = () => `${props.apiKey.start}${"*".repeat(16)}`

  return (
    <Item>
      <ItemMedia variant="icon">
        <Key />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{props.apiKey.name || apiKeyLocalization.apiKey}</ItemTitle>
        <ItemDescription class="font-mono">{preview()}</ItemDescription>
        <ItemDescription>
          {new Date(props.apiKey.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Show when={!props.hideDelete}>
          <AlertDialog open={deleteOpen()} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger
              as={Button}
              aria-label={apiKeyLocalization.deleteApiKey}
              size="sm"
              variant="outline"
            >
              <X />
              {auth.localization.settings.delete}
            </AlertDialogTrigger>
            <DeleteApiKeyDialog
              apiKey={props.apiKey}
              organizationId={props.organizationId}
              onOpenChange={setDeleteOpen}
            />
          </AlertDialog>
        </Show>
      </ItemActions>
    </Item>
  )
}
