import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
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
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"

export function ApiKey(props: {
  apiKey: ListedApiKey
  organizationId?: string
  hideDelete?: boolean
}) {
  const auth = useAuth()
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin)
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
          {apiKeyLocalization.created}{" "}
          {new Date(props.apiKey.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })}
        </ItemDescription>
        <ItemDescription>
          {props.apiKey.expiresAt
            ? `${apiKeyLocalization.expires} ${new Date(
                props.apiKey.expiresAt
              ).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short"
              })}`
            : apiKeyLocalization.neverExpires}
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
