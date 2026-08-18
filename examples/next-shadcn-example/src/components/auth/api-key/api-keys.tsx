"use client"

import type { ApiKeyAuthClient } from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useListApiKeys } from "@better-auth-ui/react/plugins/api-key"
import { Fragment, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ItemGroup, ItemSeparator } from "@/components/ui/item"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
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
  const { localization: apiKeyLocalization, pageSize } =
    useAuthPlugin(apiKeyPlugin)
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState("createdAt:desc")
  const [sortBy, sortDirection] = sort.split(":") as [string, "asc" | "desc"]

  const { data: listData, isPending: isListPending } = useListApiKeys(
    authClient,
    {
      enabled: !isPendingProp,
      query: {
        limit: pageSize,
        offset: page * pageSize,
        sortBy,
        sortDirection,
        ...(organizationId ? { organizationId, configId: "organization" } : {})
      }
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
      <Select
        value={sort}
        onValueChange={(value) => {
          setSort(value)
          setPage(0)
        }}
      >
        <SelectTrigger aria-label={apiKeyLocalization.sortBy}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt:desc">
            {apiKeyLocalization.newest}
          </SelectItem>
          <SelectItem value="createdAt:asc">
            {apiKeyLocalization.oldest}
          </SelectItem>
          <SelectItem value="name:asc">
            {apiKeyLocalization.nameAscending}
          </SelectItem>
          <SelectItem value="name:desc">
            {apiKeyLocalization.nameDescending}
          </SelectItem>
        </SelectContent>
      </Select>

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
            <ItemGroup className="gap-0">
              {listData.apiKeys.map((key, index) => (
                <Fragment key={key.id}>
                  {index > 0 && <ItemSeparator />}
                  <ApiKey
                    apiKey={key}
                    hideDelete={hideDelete}
                    organizationId={organizationId}
                  />
                </Fragment>
              ))}
            </ItemGroup>
          )}
        </CardContent>
      </Card>
      {(page > 0 || (listData?.apiKeys.length ?? 0) === pageSize) && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((value) => Math.max(0, value - 1))}
          >
            {apiKeyLocalization.previousPage}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={(listData?.apiKeys.length ?? 0) < pageSize}
            onClick={() => setPage((value) => value + 1)}
          >
            {apiKeyLocalization.nextPage}
          </Button>
        </div>
      )}

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
