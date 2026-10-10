import { validateAbsoluteUrl, validateStringLength } from "@better-auth-ui/core"
import {
  createBetterAuthOAuthClientManager,
  type OAuthProviderAuthClient,
  type OAuthClientManager,
  type OAuthClientOwner,
  type ManagedOAuthClient,
  type OAuthClientInput
} from "@better-auth-ui/core/plugins/oauth-provider"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useOAuthClients,
  useCreateOAuthClient,
  useUpdateOAuthClient,
  useDeleteOAuthClient,
  useRotateOAuthClientSecret,
  useSetOAuthClientDisabled
} from "@better-auth-ui/react/plugins/oauth-provider"
import { useMemo, useState } from "react"
import { oauthProviderPlugin } from "../../../lib/auth/oauth-provider-plugin"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { Select } from "../../../primitives/menu"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"
import { useAuthForm } from "../auth-form"
import { CopyValue } from "../copy-value"

type ClientAction =
  | { type: "create" }
  | {
      type: "edit" | "delete" | "rotate" | "toggle"
      client: ManagedOAuthClient
    }
export type OAuthClientsProps = CardSlotProps & {
  manager: OAuthClientManager
  owner: OAuthClientOwner
  ownerKey: string
}

export function OAuthClients({
  manager,
  owner,
  ownerKey,
  ...props
}: OAuthClientsProps) {
  const { localization } = useAuthPlugin(oauthProviderPlugin)
  const clients = useOAuthClients(manager, owner, ownerKey)
  const [action, setAction] = useState<ClientAction>()
  return (
    <Box className={props.className ?? "gap-4"}>
      <Txt className="font-semibold">{localization.oauthClients}</Txt>
      <Description>{localization.oauthClientsDescription}</Description>
      <Button onPress={() => setAction({ type: "create" })}>
        {localization.createClient}
      </Button>
      {clients.isPending ? <Skeleton className="h-20 w-full" /> : null}
      {clients.error ? (
        <Txt accessibilityRole="alert">{clients.error.message}</Txt>
      ) : null}
      {clients.data?.length === 0 ? (
        <Description>{localization.noOAuthClientsDescription}</Description>
      ) : null}
      {clients.data?.map((client) => (
        <Card key={client.client_id} variant={props.variant}>
          <Card.Header>
            <Card.Title>{client.client_name || client.client_id}</Card.Title>
          </Card.Header>
          <Card.Content className="gap-3">
            <CopyValue value={client.client_id} label={localization.clientId} />
            <Description>
              {client.application_type === "native"
                ? localization.nativeApplication
                : localization.webApplication}
            </Description>
            <Description>
              {client.disabled ? localization.disabled : localization.enabled}
            </Description>
            {client.redirect_uris.map((uri) => (
              <Txt key={uri} selectable>
                {uri}
              </Txt>
            ))}
            <Button onPress={() => setAction({ type: "edit", client })}>
              {localization.editClient}
            </Button>
            {client.token_endpoint_auth_method !== "none" ? (
              <Button onPress={() => setAction({ type: "rotate", client })}>
                {localization.rotateSecret}
              </Button>
            ) : null}
            {manager.setDisabled ? (
              <Button onPress={() => setAction({ type: "toggle", client })}>
                {client.disabled ? localization.enabled : localization.disabled}
              </Button>
            ) : null}
            <Button
              variant="danger"
              onPress={() => setAction({ type: "delete", client })}
            >
              {localization.deleteClient}
            </Button>
          </Card.Content>
        </Card>
      ))}
      {action ? (
        <ClientDialog
          key={
            action.type === "create"
              ? "create"
              : `${action.client.client_id}:${action.type}`
          }
          manager={manager}
          owner={owner}
          ownerKey={ownerKey}
          action={action}
          onClose={() => setAction(undefined)}
        />
      ) : null}
    </Box>
  )
}

function ClientDialog({
  manager,
  owner,
  ownerKey,
  action,
  onClose
}: OAuthClientsProps & { action: ClientAction; onClose: () => void }) {
  const { localization: common } = useAuth()
  const { localization } = useAuthPlugin(oauthProviderPlugin)
  const create = useCreateOAuthClient(manager, owner, ownerKey)
  const update = useUpdateOAuthClient(manager, owner, ownerKey)
  const remove = useDeleteOAuthClient(manager, owner, ownerKey)
  const rotate = useRotateOAuthClientSecret(manager, owner, ownerKey)
  const toggle = useSetOAuthClientDisabled(manager, owner, ownerKey)
  const [secret, setSecret] = useState<string>()
  const initial = action.type === "create" ? undefined : action.client
  const [type, setType] = useState<"web" | "native">(
    initial?.application_type ?? "web"
  )
  const [authentication, setAuthentication] = useState(
    initial?.token_endpoint_auth_method ?? "client_secret_basic"
  )
  const pending = [create, update, remove, rotate, toggle].some(
    (mutation) => mutation.isPending
  )
  const form = useAuthForm({
    defaultValues: {
      client_name: initial?.client_name ?? "",
      redirect_uris: initial?.redirect_uris.join("\n") ?? "",
      post_logout_redirect_uris:
        initial?.post_logout_redirect_uris?.join("\n") ?? "",
      client_uri: initial?.client_uri ?? "",
      logo_uri: initial?.logo_uri ?? "",
      scope: initial?.scope ?? ""
    },
    onSubmit: async ({ value }) => {
      const id = initial?.client_id ?? ""
      const input: OAuthClientInput = {
        client_name: value.client_name.trim(),
        redirect_uris: value.redirect_uris
          .split(/\n/)
          .map((uri) => uri.trim())
          .filter(Boolean),
        post_logout_redirect_uris: value.post_logout_redirect_uris
          .split(/\n/)
          .map((uri) => uri.trim())
          .filter(Boolean),
        client_uri: value.client_uri.trim() || undefined,
        logo_uri: value.logo_uri.trim() || undefined,
        scope: value.scope.trim() || undefined,
        application_type: type,
        token_endpoint_auth_method: authentication
      }
      try {
        if (action.type === "create") {
          const result = await create.mutateAsync(input)
          if (result.client_secret) {
            setSecret(result.client_secret)
            return
          }
        } else if (action.type === "edit")
          await update.mutateAsync({ clientId: id, update: input })
        else if (action.type === "delete") await remove.mutateAsync(id)
        else if (action.type === "rotate") {
          const result = await rotate.mutateAsync(id)
          if (result.client_secret) {
            setSecret(result.client_secret)
            return
          }
        } else
          await toggle.mutateAsync({
            clientId: id,
            disabled: !initial?.disabled
          })
        onClose()
      } finally {
        create.reset()
        rotate.reset()
      }
    }
  })
  const title =
    action.type === "create"
      ? localization.createClient
      : action.type === "edit"
        ? localization.editClient
        : action.type === "delete"
          ? localization.deleteClientTitle
          : action.type === "rotate"
            ? localization.rotateSecretTitle
            : initial?.disabled
              ? localization.enabled
              : localization.disabled
  const labels = {
    client_name: localization.clientName,
    redirect_uris: localization.redirectUrls,
    post_logout_redirect_uris: localization.redirectUrls,
    client_uri: localization.applicationUrl,
    logo_uri: localization.logoUrl,
    scope: localization.scopes
  }
  return (
    <AlertDialog
      isOpen
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <AlertDialog.Header>
        <AlertDialog.Heading>{title}</AlertDialog.Heading>
      </AlertDialog.Header>
      <AlertDialog.Body>
        {secret ? (
          <>
            <Description>{localization.clientSecretWarning}</Description>
            <CopyValue value={secret} label={localization.clientSecret} />
            <Button onPress={onClose}>{localization.cancel}</Button>
          </>
        ) : (
          <form.AppForm>
            <form.AuthFormRoot className="gap-4">
              {action.type === "create" || action.type === "edit" ? (
                <>
                  <Select
                    label={localization.applicationType}
                    selectedKey={type}
                    options={[
                      { key: "web", label: localization.webApplication },
                      { key: "native", label: localization.nativeApplication }
                    ]}
                    isDisabled={pending}
                    onSelectionChange={(key) => setType(key as typeof type)}
                  />
                  <Select
                    label={localization.clientSecret}
                    selectedKey={authentication}
                    options={[
                      { key: "none", label: localization.nativeApplication },
                      {
                        key: "client_secret_basic",
                        label: "client_secret_basic"
                      },
                      { key: "client_secret_post", label: "client_secret_post" }
                    ]}
                    isDisabled={pending}
                    onSelectionChange={setAuthentication}
                  />
                  {(Object.keys(labels) as (keyof typeof labels)[]).map(
                    (name) => (
                      <form.AppField
                        key={name}
                        name={name}
                        validators={{
                          onChange: ({ value }) => {
                            if (name === "client_name")
                              return validateStringLength(value, {
                                trim: true,
                                requiredMessage: common.auth.fieldRequired
                              })
                            if (name.endsWith("redirect_uris")) {
                              const entries = value
                                .split(/\n/)
                                .map((uri) => uri.trim())
                                .filter(Boolean)
                              if (name === "redirect_uris" && !entries.length)
                                return common.auth.fieldRequired
                              for (const entry of entries) {
                                try {
                                  const url = new URL(entry)
                                  if (
                                    [
                                      "javascript:",
                                      "data:",
                                      "file:",
                                      "blob:",
                                      "about:"
                                    ].includes(url.protocol) ||
                                    (type === "web" &&
                                      !["http:", "https:"].includes(
                                        url.protocol
                                      )) ||
                                    url.username ||
                                    url.password ||
                                    url.hash
                                  )
                                    return localization.invalidUrl
                                } catch {
                                  return localization.invalidUrl
                                }
                              }
                            }
                            if (name === "client_uri" || name === "logo_uri")
                              return value.trim()
                                ? validateAbsoluteUrl(value, {
                                    invalidMessage: localization.invalidUrl
                                  })
                                : undefined
                          }
                        }}
                      >
                        {(field) => (
                          <field.AuthFormTextField
                            label={labels[name]}
                            isDisabled={pending}
                            inputProps={{
                              multiline: name.endsWith("redirect_uris"),
                              autoCapitalize: "none"
                            }}
                          />
                        )}
                      </form.AppField>
                    )
                  )}
                </>
              ) : (
                <Description>
                  {action.type === "delete"
                    ? localization.deleteClientDescription
                    : action.type === "rotate"
                      ? localization.rotateSecretDescription
                      : (initial?.client_name ?? initial?.client_id)}
                </Description>
              )}
              <AlertDialog.Footer>
                <Button isDisabled={pending} onPress={onClose}>
                  {localization.cancel}
                </Button>
                <form.AuthFormSubmitButton
                  isPending={pending}
                  variant={action.type === "delete" ? "danger" : "primary"}
                >
                  {title}
                </form.AuthFormSubmitButton>
              </AlertDialog.Footer>
            </form.AuthFormRoot>
          </form.AppForm>
        )}
      </AlertDialog.Body>
    </AlertDialog>
  )
}

export function UserOAuthClients(props: CardSlotProps) {
  const { authClient } = useAuth()
  const { clientManager } = useAuthPlugin(oauthProviderPlugin)
  const session = useSession(authClient)
  const manager = useMemo(
    () =>
      clientManager ??
      createBetterAuthOAuthClientManager(authClient as OAuthProviderAuthClient),
    [authClient, clientManager]
  )
  return session.data ? (
    <OAuthClients
      {...props}
      manager={manager}
      owner={{ type: "user" }}
      ownerKey={`user:${session.data.user.id}`}
    />
  ) : (
    <Skeleton className="h-10 w-full" />
  )
}

export function OrganizationOAuthClients({
  organizationId,
  organizationSlug,
  ...props
}: CardSlotProps & { organizationId: string; organizationSlug: string }) {
  const { organizationClientManager } = useAuthPlugin(oauthProviderPlugin)
  if (!organizationClientManager)
    throw new Error("Configure an organization OAuth client manager.")
  return (
    <OAuthClients
      {...props}
      manager={organizationClientManager}
      owner={{ type: "organization", organizationId, organizationSlug }}
      ownerKey={`organization:${organizationId}:${organizationSlug}`}
    />
  )
}
