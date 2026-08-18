import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { Key, Pencil, X } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import { DeleteApiKeyDialog } from "@/components/auth/api-key/delete-api-key-dialog"
import type { ListedApiKey } from "@/components/auth/settings/shared/types"
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
import { EditApiKeyDialog } from "./edit-api-key-dialog"

export function ApiKey(props: {
  apiKey: ListedApiKey
  organizationId?: string
  hideDelete?: boolean
}) {
  const auth = useAuth()
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin)
  const [deleteOpen, setDeleteOpen] = createSignal(false)
  const [editOpen, setEditOpen] = createSignal(false)
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
        <ItemDescription>
          {props.apiKey.enabled
            ? apiKeyLocalization.enabled
            : apiKeyLocalization.disabled}
          {` · ${apiKeyLocalization.requests}: ${props.apiKey.requestCount}`}
          {props.apiKey.remaining === null
            ? ""
            : ` · ${apiKeyLocalization.remaining}: ${props.apiKey.remaining}`}
        </ItemDescription>
        <ItemDescription>
          {apiKeyLocalization.lastRequest}:{" "}
          {props.apiKey.lastRequest
            ? new Date(props.apiKey.lastRequest).toLocaleString()
            : apiKeyLocalization.neverRequested}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Dialog open={editOpen()} onOpenChange={setEditOpen}>
          <DialogTrigger as={Button} size="sm" variant="outline">
            <Pencil />
            {apiKeyLocalization.editApiKey}
          </DialogTrigger>
          <EditApiKeyDialog
            apiKey={props.apiKey}
            open={editOpen()}
            onOpenChange={setEditOpen}
          />
        </Dialog>
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
