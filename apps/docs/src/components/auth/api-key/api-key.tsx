"use client"

import type { ListedApiKey } from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { Key, X } from "lucide-react"
import { useState } from "react"

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
import { DeleteApiKeyDialog } from "./delete-api-key-dialog"

export type ApiKeyProps = {
  apiKey: ListedApiKey
  /** Hide the row's delete button (e.g., when caller lacks `apiKey:delete`). */
  hideDelete?: boolean
  /** Scope the delete payload to an organization (sets `configId`). */
  organizationId?: string
}

export function ApiKey({ apiKey, hideDelete, organizationId }: ApiKeyProps) {
  const { localization } = useAuth()
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const preview = `${apiKey.start}${"*".repeat(16)}`

  return (
    <Item>
      <ItemMedia variant="icon">
        <Key />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{apiKey.name || apiKeyLocalization.apiKey}</ItemTitle>
        <ItemDescription className="font-mono">{preview}</ItemDescription>
        <ItemDescription>
          {apiKeyLocalization.created}{" "}
          {new Date(apiKey.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })}
        </ItemDescription>
        <ItemDescription>
          {apiKey.expiresAt
            ? `${apiKeyLocalization.expires} ${new Date(
                apiKey.expiresAt
              ).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short"
              })}`
            : apiKeyLocalization.neverExpires}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        {!hideDelete && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              aria-label={apiKeyLocalization.deleteApiKey}
            >
              <X />

              {localization.settings.delete}
            </Button>

            <DeleteApiKeyDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              apiKey={apiKey}
              organizationId={organizationId}
            />
          </>
        )}
      </ItemActions>
    </Item>
  )
}
