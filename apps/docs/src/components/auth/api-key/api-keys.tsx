"use client"

import type { ApiKeyAuthClient } from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useListApiKeys } from "@better-auth-ui/react/plugins/api-key"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
import { cn } from "@/lib/utils"
import { ApiKey } from "./api-key"
import { ApiKeySkeleton } from "./api-key-skeleton"
import { ApiKeysEmpty } from "./api-keys-empty"
import { CreateApiKeyDialog } from "./create-api-key-dialog"

export type ApiKeysProps = {
  className?: string
  /** Scope the list and create payload to an organization. */
  organizationId?: string
  /** Force the loading skeleton and disable the list query. */
  isPending?: boolean
  /** Hide the "Create API key" button (header + empty state). */
  hideCreate?: boolean
  /** Hide the per-row delete button on listed keys. */
  hideDelete?: boolean
}

export function ApiKeys({
  className,
  organizationId,
  isPending: isPendingProp,
  hideCreate,
  hideDelete
}: ApiKeysProps) {
  const { authClient } = useAuth<ApiKeyAuthClient>()
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin)

  const { data: listData, isPending: isListPending } = useListApiKeys(
    authClient,
    {
      enabled: !isPendingProp,
      ...(organizationId
        ? { query: { organizationId, configId: "organization" } }
        : {})
    }
  )

  const isPending = isPendingProp || isListPending

  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <h2 className="truncate text-sm font-semibold">
          {apiKeyLocalization.apiKeys}
        </h2>

        {!hideCreate && (
          <Button
            className="shrink-0"
            size="sm"
            disabled={isPending}
            onClick={() => setCreateOpen(true)}
          >
            {apiKeyLocalization.createApiKey}
          </Button>
        )}
      </div>

      <Card className="p-0">
        <CardContent className="p-0">
          {isPending ? (
            <ApiKeySkeleton />
          ) : !listData?.apiKeys.length ? (
            <ApiKeysEmpty
              onCreatePress={() => setCreateOpen(true)}
              hideCreate={hideCreate}
            />
          ) : (
            listData.apiKeys.map((key, index) => (
              <div key={key.id}>
                {index > 0 && <Separator />}

                <ApiKey
                  apiKey={key}
                  hideDelete={hideDelete}
                  organizationId={organizationId}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {!hideCreate && (
        <CreateApiKeyDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          organizationId={organizationId}
        />
      )}
    </div>
  )
}
