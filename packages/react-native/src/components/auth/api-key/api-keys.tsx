import type { ApiKeyAuthClient } from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useListApiKeys } from "@better-auth-ui/react/plugins/api-key"
import { useState } from "react"

import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"
import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { cn } from "../../../lib/cn"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Box, Txt } from "../../../primitives/styled"
import { ApiKey } from "./api-key"
import { ApiKeySkeleton } from "./api-key-skeleton"
import { ApiKeysEmpty } from "./api-keys-empty"
import { CreateApiKeyDialog } from "./create-api-key-dialog"

export type ApiKeysProps = SettingsViewProps & {
  /** Scope the list and create payload to an organization. */
  organizationId?: string
  /** Force the loading skeleton and disable the list query. */
  isPending?: boolean
  /** Hide the "Create API key" button (header + empty state). */
  hideCreate?: boolean
  /** Hide the per-row delete button on listed keys. */
  hideDelete?: boolean
}

/**
 * API keys security card: header ("API keys" + Create button), a `Card`
 * wrapping either the loading skeleton, the empty state, or the listed
 * `ApiKey` rows (dashed separators between rows), and mounts
 * `CreateApiKeyDialog`. Mirrors the heroui `ApiKeys`, adapted for React
 * Native: `div`s become `View`s/`Text`s and the dashed row separator is a
 * bordered `View` instead of a CSS `border-b` rule.
 */
export function ApiKeys({
  className,
  variant,
  organizationId,
  isPending: isPendingProp,
  hideCreate,
  hideDelete
}: ApiKeysProps) {
  const { authClient } = useAuth()
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin)

  const { data: listData, isPending: isListPending } = useListApiKeys(
    authClient as ApiKeyAuthClient,
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
    <Box className={cn("flex-col gap-3", className)}>
      <Box className="flex-row items-end justify-between gap-3">
        <Txt className="shrink text-sm font-semibold text-foreground">
          {apiKeyLocalization.apiKeys}
        </Txt>

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
      </Box>

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
              <Box key={key.id}>
                {index > 0 && (
                  <Box className="-mx-4 my-4 border-b border-dashed border-border" />
                )}

                <ApiKey
                  apiKey={key}
                  hideDelete={hideDelete}
                  organizationId={organizationId}
                />
              </Box>
            ))
          )}
        </Card.Content>
      </Card>

      {!hideCreate && (
        <CreateApiKeyDialog
          isOpen={createOpen}
          onOpenChange={setCreateOpen}
          organizationId={organizationId}
        />
      )}
    </Box>
  )
}
