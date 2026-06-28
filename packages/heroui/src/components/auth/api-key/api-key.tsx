import type { ListedApiKey } from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { Key, Xmark } from "@gravity-ui/icons"
import { Button } from "@heroui/react"
import { useState } from "react"

import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"
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
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
        <Key className="size-4.5" />
      </div>

      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium leading-tight truncate">
          {apiKey.name || apiKeyLocalization.apiKey}
        </span>

        <span className="text-xs text-muted font-mono truncate">{preview}</span>

        <span className="text-xs text-muted">
          {new Date(apiKey.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })}
        </span>
      </div>

      {!hideDelete && (
        <>
          <Button
            className="ml-auto shrink-0"
            variant="outline"
            size="sm"
            onPress={() => setDeleteOpen(true)}
            aria-label={apiKeyLocalization.deleteApiKey}
          >
            <Xmark />

            {localization.settings.delete}
          </Button>

          <DeleteApiKeyDialog
            isOpen={deleteOpen}
            onOpenChange={setDeleteOpen}
            apiKey={apiKey}
            organizationId={organizationId}
          />
        </>
      )}
    </div>
  )
}
