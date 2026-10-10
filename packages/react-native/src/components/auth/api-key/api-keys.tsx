import type { ApiKeyAuthClient } from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useListApiKeys } from "@better-auth-ui/react/plugins/api-key"
import { useState } from "react"
import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"
import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { SearchField } from "../../../primitives/inputs-extra"
import { Select } from "../../../primitives/menu"
import { Box, Txt } from "../../../primitives/styled"
import { ApiKey } from "./api-key"
import { ApiKeySkeleton } from "./api-key-skeleton"
import { ApiKeysEmpty } from "./api-keys-empty"
import { CreateApiKeyDialog } from "./create-api-key-dialog"
export type ApiKeysProps = SettingsViewProps & {
  organizationId?: string
  isPending?: boolean
  hideCreate?: boolean
  hideDelete?: boolean
  hideUpdate?: boolean
}
export function ApiKeys({
  organizationId,
  isPending: loading,
  hideCreate,
  hideDelete,
  hideUpdate,
  ...props
}: ApiKeysProps) {
  const { authClient } = useAuth()
  const { localization, configurations, pageSize } = useAuthPlugin(apiKeyPlugin)
  const configs = configurations.filter(
    (config) => !!config.organization === !!organizationId
  )
  const [configuration, setConfiguration] = useState(
    configs[0]?.id ?? (organizationId ? "organization" : "default")
  )
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("newest")
  const [page, setPage] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const keys = useListApiKeys(authClient as ApiKeyAuthClient, {
    enabled: !loading,
    query: {
      configId: configuration,
      ...(organizationId ? { organizationId } : {})
    }
  })
  const filtered = (keys.data?.apiKeys ?? [])
    .filter((key) =>
      (key.name ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sort === "name"
        ? (a.name ?? "").localeCompare(b.name ?? "")
        : sort === "oldest"
          ? +new Date(a.createdAt) - +new Date(b.createdAt)
          : +new Date(b.createdAt) - +new Date(a.createdAt)
    )
  const lastPage = Math.max(0, Math.ceil(filtered.length / pageSize) - 1)
  const current = Math.min(page, lastPage)
  const pending = loading || keys.isPending
  return (
    <Box className={props.className ?? "gap-3"}>
      <Txt className="font-semibold">{localization.apiKeys}</Txt>
      {configs.length ? (
        <Select
          label={localization.configuration}
          selectedKey={configuration}
          onSelectionChange={(value) => {
            setConfiguration(value)
            setPage(0)
          }}
          options={configs.map((config) => ({
            key: config.id,
            label: config.label
          }))}
        />
      ) : null}
      {!hideCreate ? (
        <Button isDisabled={pending} onPress={() => setCreateOpen(true)}>
          {localization.createApiKey}
        </Button>
      ) : null}
      <SearchField
        value={search}
        onChangeText={(value) => {
          setSearch(value)
          setPage(0)
        }}
        aria-label={localization.name}
      />
      <Select
        label={localization.sortBy}
        selectedKey={sort}
        onSelectionChange={(value) => {
          setSort(value)
          setPage(0)
        }}
        options={[
          { key: "newest", label: localization.newest },
          { key: "oldest", label: localization.oldest },
          { key: "name", label: localization.nameAscending }
        ]}
      />
      <Card variant={props.variant}>
        <Card.Content className="gap-4">
          {pending ? (
            <ApiKeySkeleton />
          ) : keys.error ? (
            <Txt accessibilityRole="alert">{keys.error.message}</Txt>
          ) : !filtered.length ? (
            <ApiKeysEmpty
              hideCreate={hideCreate}
              onCreatePress={() => setCreateOpen(true)}
            />
          ) : (
            filtered
              .slice(current * pageSize, (current + 1) * pageSize)
              .map((key) => (
                <ApiKey
                  key={key.id}
                  apiKey={key}
                  configId={configuration}
                  hideDelete={hideDelete}
                  hideUpdate={hideUpdate}
                  organizationId={organizationId}
                />
              ))
          )}
        </Card.Content>
      </Card>
      <Box className="flex-row gap-3">
        <Button isDisabled={current === 0} onPress={() => setPage(current - 1)}>
          {localization.previousPage}
        </Button>
        <Txt>
          {current + 1} / {lastPage + 1}
        </Txt>
        <Button
          isDisabled={current === lastPage}
          onPress={() => setPage(current + 1)}
        >
          {localization.nextPage}
        </Button>
      </Box>
      {!hideCreate ? (
        <CreateApiKeyDialog
          key={configuration}
          isOpen={createOpen}
          onOpenChange={setCreateOpen}
          configId={configuration}
          organizationId={organizationId}
        />
      ) : null}
    </Box>
  )
}
