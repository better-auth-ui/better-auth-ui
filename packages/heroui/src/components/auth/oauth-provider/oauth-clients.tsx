"use client"

import {
  createBetterAuthOAuthClientManager,
  type ManagedOAuthClient,
  type OAuthClientInput,
  type OAuthClientManager,
  type OAuthClientOwner,
  type OAuthProviderAuthClient
} from "@better-auth-ui/core/plugins/oauth-provider"
import {
  useAuth,
  useAuthPlugin,
  useCopyToClipboard,
  useSession
} from "@better-auth-ui/react"
import {
  useCreateOAuthClient,
  useDeleteOAuthClient,
  useOAuthClients,
  useRotateOAuthClientSecret,
  useSetOAuthClientDisabled,
  useUpdateOAuthClient
} from "@better-auth-ui/react/plugins/oauth-provider"
import {
  ArrowRotateLeft,
  Check,
  CirclePlus,
  Code,
  Copy,
  Pencil,
  TrashBin
} from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  Card,
  type CardProps,
  cn,
  FieldError,
  Form,
  Input,
  InputGroup,
  Label,
  ListBox,
  Modal,
  Select,
  Spinner,
  Switch,
  TextArea,
  TextField,
  toast
} from "@heroui/react"
import { useForm } from "@tanstack/react-form"
import { useMemo, useState } from "react"

import { oauthProviderPlugin } from "../../../lib/auth/oauth-provider-plugin"

type ClientAction =
  | { kind: "delete"; client: ManagedOAuthClient }
  | { kind: "rotate"; client: ManagedOAuthClient }

type OAuthClientFormValues = {
  applicationType: "native" | "web"
  clientName: string
  clientUri: string
  logoUri: string
  redirectUris: string
  scope: string
}

export type OAuthClientsProps = {
  manager: OAuthClientManager
  owner: OAuthClientOwner
  ownerKey?: string
  className?: string
  variant?: CardProps["variant"]
}

const lines = (value: string) =>
  Array.from(
    new Set(
      value
        .split(/\r?\n/)
        .map((entry) => entry.trim())
        .filter(Boolean)
    )
  )

const getOAuthClientFormValues = (
  client?: ManagedOAuthClient
): OAuthClientFormValues => ({
  applicationType: client?.application_type === "native" ? "native" : "web",
  clientName: client?.client_name ?? "",
  clientUri: client?.client_uri ?? "",
  logoUri: client?.logo_uri ?? "",
  redirectUris: client?.redirect_uris.join("\n") ?? "",
  scope: client?.scope ?? ""
})

export function OAuthClients({
  manager,
  owner,
  ownerKey,
  className,
  variant
}: OAuthClientsProps) {
  const { localization: oauthLocalization } = useAuthPlugin(oauthProviderPlugin)
  const { localization } = useAuth()
  const clients = useOAuthClients(manager, owner, ownerKey)
  const createClient = useCreateOAuthClient(manager, owner, ownerKey)
  const updateClient = useUpdateOAuthClient(manager, owner, ownerKey)
  const deleteClient = useDeleteOAuthClient(manager, owner, ownerKey)
  const rotateSecret = useRotateOAuthClientSecret(manager, owner, ownerKey)
  const setDisabled = useSetOAuthClientDisabled(manager, owner, ownerKey)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ManagedOAuthClient>()
  const [action, setAction] = useState<ClientAction>()
  const [secret, setSecret] = useState<ManagedOAuthClient>()
  const { copied, copy, reset } = useCopyToClipboard({
    onError: (error) =>
      toast.danger(error instanceof Error ? error.message : String(error))
  })
  const form = useForm({
    defaultValues: getOAuthClientFormValues(),
    onSubmit: async ({ value }) => {
      const input: OAuthClientInput = {
        client_name: value.clientName.trim(),
        application_type: value.applicationType,
        redirect_uris: lines(value.redirectUris),
        client_uri: value.clientUri.trim() || undefined,
        logo_uri: value.logoUri.trim() || undefined,
        scope: value.scope.trim() || undefined
      }

      try {
        if (editingClient) {
          await updateClient.mutateAsync({
            clientId: editingClient.client_id,
            update: input
          })
          setEditorOpen(false)
          return
        }

        const client = await createClient.mutateAsync(input)
        setEditorOpen(false)
        setSecret(client)
      } catch {
        // The mutation keeps its error state for the host application.
      }
    }
  })

  const openCreate = () => {
    setEditingClient(undefined)
    form.reset(getOAuthClientFormValues())
    setEditorOpen(true)
  }

  const openEdit = (client: ManagedOAuthClient) => {
    setEditingClient(client)
    form.reset(getOAuthClientFormValues(client))
    setEditorOpen(true)
  }

  const confirmAction = () => {
    if (!action) return

    if (action.kind === "delete") {
      deleteClient.mutate(action.client.client_id, {
        onSuccess: () => setAction(undefined)
      })
      return
    }

    rotateSecret.mutate(action.client.client_id, {
      onSuccess: (client) => {
        setAction(undefined)
        setSecret(client)
      }
    })
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate text-sm font-semibold">
            {oauthLocalization.oauthClients}
          </h2>
          <p className="text-muted text-sm">
            {oauthLocalization.oauthClientsDescription}
          </p>
        </div>
        <Button
          className="shrink-0"
          size="sm"
          onPress={openCreate}
          isDisabled={clients.isPending}
        >
          <CirclePlus />
          {oauthLocalization.createClient}
        </Button>
      </div>

      <Card variant={variant}>
        <Card.Content className="flex flex-col gap-4">
          {clients.isPending ? (
            <div className="flex min-h-28 items-center justify-center">
              <Spinner aria-label={oauthLocalization.oauthClients} />
            </div>
          ) : clients.data?.length ? (
            clients.data.map((client) => (
              <div
                key={client.client_id}
                className="flex flex-col gap-3 border-b border-dashed pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex min-w-0 gap-3">
                  <div className="bg-default mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <Code className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {client.client_name || oauthLocalization.application}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs",
                          client.disabled
                            ? "bg-danger-soft text-danger-soft-foreground"
                            : "bg-success-soft text-success-soft-foreground"
                        )}
                      >
                        {client.disabled
                          ? oauthLocalization.disabled
                          : oauthLocalization.enabled}
                      </span>
                    </div>
                    <p className="text-muted mt-1 truncate font-mono text-xs">
                      {client.client_id}
                    </p>
                    <p className="text-muted mt-1 text-xs">
                      {client.redirect_uris.length}{" "}
                      {oauthLocalization.redirectUrls.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1">
                  {manager.setDisabled && (
                    <Switch
                      aria-label={`${client.client_name || client.client_id}: ${
                        client.disabled
                          ? oauthLocalization.disabled
                          : oauthLocalization.enabled
                      }`}
                      size="sm"
                      isSelected={!client.disabled}
                      isDisabled={setDisabled.isPending}
                      onChange={(enabled) =>
                        setDisabled.mutate({
                          clientId: client.client_id,
                          disabled: !enabled
                        })
                      }
                    >
                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Content>
                    </Switch>
                  )}
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={oauthLocalization.editClient}
                    onPress={() => openEdit(client)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={oauthLocalization.rotateSecret}
                    onPress={() => setAction({ kind: "rotate", client })}
                  >
                    <ArrowRotateLeft />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={oauthLocalization.deleteClient}
                    onPress={() => setAction({ kind: "delete", client })}
                  >
                    <TrashBin />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
              <div className="bg-default flex size-10 items-center justify-center rounded-xl">
                <Code />
              </div>
              <div className="flex max-w-sm flex-col gap-1">
                <p className="text-sm font-medium">
                  {oauthLocalization.noOAuthClients}
                </p>
                <p className="text-muted text-sm">
                  {oauthLocalization.noOAuthClientsDescription}
                </p>
              </div>
              <Button size="sm" variant="outline" onPress={openCreate}>
                {oauthLocalization.createClient}
              </Button>
            </div>
          )}
        </Card.Content>
      </Card>

      <Modal.Backdrop isOpen={editorOpen} onOpenChange={setEditorOpen}>
        <Modal.Container>
          <Modal.Dialog>
            <Form
              onSubmit={(event) => {
                event.preventDefault()
                void form.handleSubmit()
              }}
            >
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Icon>
                  {editingClient ? <Pencil /> : <CirclePlus />}
                </Modal.Icon>
                <Modal.Heading>
                  {editingClient
                    ? oauthLocalization.editClient
                    : oauthLocalization.createClient}
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-4 overflow-visible">
                <form.Field name="clientName">
                  {(field) => (
                    <TextField
                      isRequired
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={field.handleChange}
                      value={field.state.value}
                    >
                      <Label>{oauthLocalization.clientName}</Label>
                      <Input autoFocus variant="secondary" />
                      <FieldError />
                    </TextField>
                  )}
                </form.Field>
                <form.Field name="applicationType">
                  {(field) => (
                    <Select
                      name={field.name}
                      onChange={(value) =>
                        field.handleChange(String(value) as "native" | "web")
                      }
                      value={field.state.value}
                      variant="secondary"
                    >
                      <Label>{oauthLocalization.applicationType}</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item id="web">
                            {oauthLocalization.webApplication}
                          </ListBox.Item>
                          <ListBox.Item id="native">
                            {oauthLocalization.nativeApplication}
                          </ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  )}
                </form.Field>
                <form.Field name="redirectUris">
                  {(field) => (
                    <TextField
                      isRequired
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={field.handleChange}
                      value={field.state.value}
                    >
                      <Label>{oauthLocalization.redirectUrls}</Label>
                      <TextArea rows={3} variant="secondary" />
                      <p className="text-muted text-xs">
                        {oauthLocalization.redirectUrlsDescription}
                      </p>
                      <FieldError />
                    </TextField>
                  )}
                </form.Field>
                {(
                  [
                    ["clientUri", oauthLocalization.applicationUrl, "url"],
                    ["logoUri", oauthLocalization.logoUrl, "url"],
                    ["scope", oauthLocalization.scopes, "text"]
                  ] as const
                ).map(([name, label, type]) => (
                  <form.Field key={name} name={name}>
                    {(field) => (
                      <TextField
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        value={field.state.value}
                      >
                        <Label>{label}</Label>
                        <Input
                          placeholder={
                            name === "scope"
                              ? "openid profile email"
                              : undefined
                          }
                          type={type}
                          variant="secondary"
                        />
                      </TextField>
                    )}
                  </form.Field>
                ))}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="ghost" onPress={() => setEditorOpen(false)}>
                  {oauthLocalization.cancel}
                </Button>
                <form.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <Button type="submit" isPending={isSubmitting}>
                      {editingClient
                        ? oauthLocalization.saveChanges
                        : oauthLocalization.createClient}
                    </Button>
                  )}
                </form.Subscribe>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <AlertDialog.Backdrop
        isOpen={Boolean(action)}
        onOpenChange={(open) => !open && setAction(undefined)}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger">
                {action?.kind === "delete" ? <TrashBin /> : <ArrowRotateLeft />}
              </AlertDialog.Icon>
              <AlertDialog.Heading>
                {action?.kind === "delete"
                  ? oauthLocalization.deleteClientTitle
                  : oauthLocalization.rotateSecretTitle}
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              {action?.kind === "delete"
                ? oauthLocalization.deleteClientDescription
                : oauthLocalization.rotateSecretDescription}
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="ghost" onPress={() => setAction(undefined)}>
                {oauthLocalization.cancel}
              </Button>
              <Button
                variant="danger"
                isPending={deleteClient.isPending || rotateSecret.isPending}
                onPress={confirmAction}
              >
                {action?.kind === "delete"
                  ? oauthLocalization.deleteClient
                  : oauthLocalization.rotateSecret}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>

      <Modal.Backdrop
        isOpen={Boolean(secret)}
        onOpenChange={(open) => {
          if (!open) {
            setSecret(undefined)
            reset()
          }
        }}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon>
                <Code />
              </Modal.Icon>
              <Modal.Heading>
                {secret?.client_name || oauthLocalization.clientSecret}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4 overflow-visible">
              <p className="text-muted text-sm">
                {oauthLocalization.clientSecretWarning}
              </p>
              <TextField value={secret?.client_id ?? ""}>
                <Label>{oauthLocalization.clientId}</Label>
                <Input
                  readOnly
                  className="font-mono text-xs"
                  variant="secondary"
                />
              </TextField>
              <TextField value={secret?.client_secret ?? ""}>
                <Label>{oauthLocalization.clientSecret}</Label>
                <InputGroup variant="secondary">
                  <InputGroup.Input readOnly className="font-mono text-xs" />
                  <InputGroup.Suffix className="px-0">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      aria-label={
                        copied
                          ? localization.settings.copiedToClipboard
                          : localization.settings.copyToClipboard
                      }
                      onPress={() =>
                        secret?.client_secret && copy(secret.client_secret)
                      }
                    >
                      {copied ? <Check /> : <Copy />}
                    </Button>
                  </InputGroup.Suffix>
                </InputGroup>
              </TextField>
            </Modal.Body>
            <Modal.Footer>
              <Button
                onPress={() => {
                  setSecret(undefined)
                  reset()
                }}
              >
                {oauthLocalization.continue}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  )
}

export function UserOAuthClients(
  props: Omit<OAuthClientsProps, "manager" | "owner" | "ownerKey">
) {
  const { authClient } = useAuth()
  const { clientManager } = useAuthPlugin(oauthProviderPlugin)
  const { data: session } = useSession(authClient)
  const defaultManager = useMemo(
    () =>
      createBetterAuthOAuthClientManager(authClient as OAuthProviderAuthClient),
    [authClient]
  )

  return (
    <OAuthClients
      {...props}
      manager={clientManager ?? defaultManager}
      owner={{ type: "user" }}
      ownerKey={session?.user.id}
    />
  )
}

export function OrganizationOAuthClients({
  organizationId,
  organizationSlug,
  ...props
}: Omit<OAuthClientsProps, "manager" | "owner" | "ownerKey"> & {
  organizationId: string
  organizationSlug: string
}) {
  const { organizationClientManager } = useAuthPlugin(oauthProviderPlugin)

  if (!organizationClientManager) return null

  return (
    <OAuthClients
      {...props}
      manager={organizationClientManager}
      owner={{ type: "organization", organizationId, organizationSlug }}
      ownerKey={`organization:${organizationId}:${organizationSlug}`}
    />
  )
}
