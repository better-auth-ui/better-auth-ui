import type { ApiKeyAuthClient } from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useListApiKeys } from "@better-auth-ui/react/plugins/api-key"
import {
  Button,
  Card,
  type CardProps,
  cn,
  Label,
  ListBox,
  Select
} from "@heroui/react"
import { useState } from "react"

import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"
import { ApiKey } from "./api-key"
import { ApiKeySkeleton } from "./api-key-skeleton"
import { ApiKeysEmpty } from "./api-keys-empty"
import { CreateApiKeyDialog } from "./create-api-key-dialog"

export type ApiKeysProps = {
  className?: string
  variant?: CardProps["variant"]
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
  variant,
  organizationId,
  isPending: isPendingProp,
  hideCreate,
  hideDelete
}: ApiKeysProps) {
  const { authClient } = useAuth()
  const { localization: apiKeyLocalization, pageSize } =
    useAuthPlugin(apiKeyPlugin)
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState("createdAt:desc")
  const [sortBy, sortDirection] = sort.split(":") as [string, "asc" | "desc"]

  const { data: listData, isPending: isListPending } = useListApiKeys(
    authClient as ApiKeyAuthClient,
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
        <h2 className="text-sm font-semibold truncate">
          {apiKeyLocalization.apiKeys}
        </h2>

        {!hideCreate && (
          <Button
            className="shrink-0"
            size="sm"
            isDisabled={isPending}
            onPress={() => setCreateOpen(true)}
          >
            {apiKeyLocalization.createApiKey}
          </Button>
        )}
      </div>
      <Select
        aria-label={apiKeyLocalization.sortBy}
        value={sort}
        onChange={(value) => {
          setSort(String(value))
          setPage(0)
        }}
      >
        <Label>{apiKeyLocalization.sortBy}</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="createdAt:desc">
              {apiKeyLocalization.newest}
            </ListBox.Item>
            <ListBox.Item id="createdAt:asc">
              {apiKeyLocalization.oldest}
            </ListBox.Item>
            <ListBox.Item id="name:asc">
              {apiKeyLocalization.nameAscending}
            </ListBox.Item>
            <ListBox.Item id="name:desc">
              {apiKeyLocalization.nameDescending}
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>

      <Card variant={variant}>
        <Card.Content>
          {isPending ? (
            <ApiKeySkeleton />
          ) : !listData?.apiKeys.length ? (
            <ApiKeysEmpty
              onCreatePress={() => setCreateOpen(true)}
              hideCreate={hideCreate}
            />
          ) : (
            listData?.apiKeys.map((key, index) => (
              <div key={key.id}>
                {index > 0 && (
                  <div className="border-b border-dashed -mx-4 my-4" />
                )}

                <ApiKey
                  apiKey={key}
                  hideDelete={hideDelete}
                  organizationId={organizationId}
                />
              </div>
            ))
          )}
        </Card.Content>
      </Card>
      {(page > 0 || (listData?.apiKeys.length ?? 0) === pageSize) && (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            isDisabled={page === 0}
            onPress={() => setPage((value) => Math.max(0, value - 1))}
          >
            {apiKeyLocalization.previousPage}
          </Button>
          <Button
            size="sm"
            variant="outline"
            isDisabled={(listData?.apiKeys.length ?? 0) < pageSize}
            onPress={() => setPage((value) => value + 1)}
          >
            {apiKeyLocalization.nextPage}
          </Button>
        </div>
      )}

      {!hideCreate && (
        <CreateApiKeyDialog
          isOpen={createOpen}
          onOpenChange={setCreateOpen}
          organizationId={organizationId}
        />
      )}
    </div>
  )
}
