import { EditApiKeyDialog } from "./edit-api-key-dialog"
import type { ListedApiKey } from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useState } from "react"
import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"
import { useFormatDateTime } from "../../../lib/format-date"
import { useThemeColors } from "../../../lib/theme-colors"
import { Button } from "../../../primitives/button"
import { Box, Txt } from "../../../primitives/styled"
import { Key, Xmark } from "../../../primitives/ui-icons"
import { DeleteApiKeyDialog } from "./delete-api-key-dialog"

export type ApiKeyProps = {
  apiKey: ListedApiKey
  /** Hide the row's delete button (e.g., when caller lacks `apiKey:delete`). */
  hideDelete?: boolean
  hideUpdate?: boolean
  configId?: string
  /** Scope the delete payload to an organization (sets `configId`). */
  organizationId?: string
}

/**
 * One API key row: icon chip, name/masked-preview/created-at, and a delete
 * button that opens `DeleteApiKeyDialog`. Mirrors the heroui `ApiKey`,
 * adapted for React Native: `div`s become `View`s, bare strings render inside
 * `Text`, and the created-at timestamp uses the RN `formatDateTime` helper
 * (Hermes-safe `Intl` wrapper) instead of `Date#toLocaleString` directly.
 */
export function ApiKey({
  apiKey,
  hideDelete,
  hideUpdate,
  configId,
  organizationId
}: ApiKeyProps) {
  const formatDateTime = useFormatDateTime()

  const { localization } = useAuth()
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const colors = useThemeColors()

  const preview = `${apiKey.start}${"*".repeat(16)}`

  return (
    <Box className="flex-row items-center gap-3">
      <Box className="size-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
        <Key width={18} height={18} color={colors.foreground} />
      </Box>

      <Box className="min-w-0 flex-col">
        <Txt className="text-sm font-medium leading-tight" numberOfLines={1}>
          {apiKey.name || apiKeyLocalization.apiKey}
        </Txt>

        <Txt className="text-xs text-muted font-mono" numberOfLines={1}>
          {preview}
        </Txt>

        <Txt className="text-xs text-muted">
          {formatDateTime(apiKey.createdAt)}
        </Txt>
      </Box>

      <Txt className="text-xs text-muted">
        {apiKeyLocalization.expires}:{" "}
        {apiKey.expiresAt
          ? formatDateTime(apiKey.expiresAt)
          : apiKeyLocalization.neverExpires}
      </Txt>
      {!hideUpdate ? (
        <Button size="sm" variant="secondary" onPress={() => setEditOpen(true)}>
          {apiKeyLocalization.editApiKey}
        </Button>
      ) : null}
      {editOpen ? (
        <EditApiKeyDialog
          apiKey={apiKey}
          configId={configId ?? (organizationId ? "organization" : undefined)}
          onClose={() => setEditOpen(false)}
        />
      ) : null}
      {!hideDelete && (
        <>
          <Button
            className="ml-auto shrink-0"
            variant="outline"
            size="sm"
            onPress={() => setDeleteOpen(true)}
            aria-label={apiKeyLocalization.deleteApiKey}
          >
            <Xmark width={16} height={16} color={colors.foreground} />

            {localization.settings.delete}
          </Button>

          <DeleteApiKeyDialog
            isOpen={deleteOpen}
            onOpenChange={setDeleteOpen}
            apiKey={apiKey}
            organizationId={organizationId}
            configId={configId}
          />
        </>
      )}
    </Box>
  )
}
