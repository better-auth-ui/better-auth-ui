"use client"

import type { ListedApiKey } from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { Key, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
    <Card className="bg-transparent border-0 ring-0 shadow-none">
      <CardContent className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <Key className="size-4.5" />
        </div>

        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium leading-tight">
            {apiKey.name || apiKeyLocalization.apiKey}
          </span>

          <span className="truncate font-mono text-muted-foreground text-xs">
            {preview}
          </span>

          <span className="text-muted-foreground text-xs">
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
      </CardContent>
    </Card>
  )
}
