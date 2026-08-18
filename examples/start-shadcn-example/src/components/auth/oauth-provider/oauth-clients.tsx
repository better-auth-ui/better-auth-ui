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
  Check,
  Code2,
  Copy,
  Pencil,
  Plus,
  RotateCcwKey,
  Trash2
} from "lucide-react"
import { type SyntheticEvent, useMemo, useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { oauthProviderPlugin } from "@/lib/auth/oauth-provider-plugin"
import { cn } from "@/lib/utils"

type ClientAction =
  | { kind: "delete"; client: ManagedOAuthClient }
  | { kind: "rotate"; client: ManagedOAuthClient }

export type OAuthClientsProps = {
  manager: OAuthClientManager
  owner: OAuthClientOwner
  ownerKey?: string
  className?: string
}

const uniqueLines = (value: string) =>
  Array.from(
    new Set(
      value
        .split(/\r?\n/)
        .map((entry) => entry.trim())
        .filter(Boolean)
    )
  )

export function OAuthClients({
  manager,
  owner,
  ownerKey,
  className
}: OAuthClientsProps) {
  const { localization } = useAuth()
  const { localization: oauthLocalization } = useAuthPlugin(oauthProviderPlugin)
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
      toast.error(error instanceof Error ? error.message : String(error))
  })

  const openCreate = () => {
    setEditingClient(undefined)
    setEditorOpen(true)
  }

  const handleEditorSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const input: OAuthClientInput = {
      client_name: String(formData.get("clientName") ?? "").trim(),
      application_type:
        formData.get("applicationType") === "native" ? "native" : "web",
      redirect_uris: uniqueLines(String(formData.get("redirectUris") ?? "")),
      client_uri: String(formData.get("clientUri") ?? "").trim() || undefined,
      logo_uri: String(formData.get("logoUri") ?? "").trim() || undefined,
      scope: String(formData.get("scope") ?? "").trim() || undefined
    }

    if (editingClient) {
      updateClient.mutate(
        { clientId: editingClient.client_id, update: input },
        { onSuccess: () => setEditorOpen(false) }
      )
      return
    }

    createClient.mutate(input, {
      onSuccess: (client) => {
        setEditorOpen(false)
        setSecret(client)
      }
    })
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
          <p className="text-sm text-muted-foreground">
            {oauthLocalization.oauthClientsDescription}
          </p>
        </div>
        <Button
          className="shrink-0"
          size="sm"
          disabled={clients.isPending}
          onClick={openCreate}
        >
          <Plus />
          {oauthLocalization.createClient}
        </Button>
      </div>

      <Card className="p-0">
        <CardContent className="flex flex-col gap-0 p-0">
          {clients.isPending ? (
            <div className="flex min-h-28 items-center justify-center">
              <Spinner />
              <span className="sr-only">{oauthLocalization.oauthClients}</span>
            </div>
          ) : clients.data?.length ? (
            clients.data.map((client) => (
              <div
                key={client.client_id}
                className="flex flex-col gap-3 border-b border-dashed p-4 last:border-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex min-w-0 gap-3">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Code2 className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {client.client_name || oauthLocalization.application}
                      </p>
                      <Badge
                        variant={client.disabled ? "destructive" : "secondary"}
                      >
                        {client.disabled
                          ? oauthLocalization.disabled
                          : oauthLocalization.enabled}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                      {client.client_id}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {client.redirect_uris.length}{" "}
                      {oauthLocalization.redirectUrls.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1">
                  {manager.setDisabled && (
                    <Switch
                      aria-label={
                        client.disabled
                          ? oauthLocalization.disabled
                          : oauthLocalization.enabled
                      }
                      checked={!client.disabled}
                      disabled={setDisabled.isPending}
                      onCheckedChange={(enabled) =>
                        setDisabled.mutate({
                          clientId: client.client_id,
                          disabled: !enabled
                        })
                      }
                    />
                  )}
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={oauthLocalization.editClient}
                    onClick={() => {
                      setEditingClient(client)
                      setEditorOpen(true)
                    }}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={oauthLocalization.rotateSecret}
                    onClick={() => setAction({ kind: "rotate", client })}
                  >
                    <RotateCcwKey />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={oauthLocalization.deleteClient}
                    onClick={() => setAction({ kind: "delete", client })}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <Code2 />
              </div>
              <div className="flex max-w-sm flex-col gap-1">
                <p className="text-sm font-medium">
                  {oauthLocalization.noOAuthClients}
                </p>
                <p className="text-sm text-muted-foreground">
                  {oauthLocalization.noOAuthClientsDescription}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={openCreate}>
                {oauthLocalization.createClient}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent>
          <form onSubmit={handleEditorSubmit} className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? <Pencil /> : <Plus />}
                {editingClient
                  ? oauthLocalization.editClient
                  : oauthLocalization.createClient}
              </DialogTitle>
              <DialogDescription>
                {oauthLocalization.oauthClientsDescription}
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="oauth-client-name">
                  {oauthLocalization.clientName}
                </FieldLabel>
                <Input
                  id="oauth-client-name"
                  name="clientName"
                  defaultValue={editingClient?.client_name ?? ""}
                  required
                  autoFocus
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="oauth-application-type">
                  {oauthLocalization.applicationType}
                </FieldLabel>
                <Select
                  name="applicationType"
                  defaultValue={editingClient?.application_type ?? "web"}
                >
                  <SelectTrigger id="oauth-application-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">
                      {oauthLocalization.webApplication}
                    </SelectItem>
                    <SelectItem value="native">
                      {oauthLocalization.nativeApplication}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="oauth-redirect-uris">
                  {oauthLocalization.redirectUrls}
                </FieldLabel>
                <Textarea
                  id="oauth-redirect-uris"
                  name="redirectUris"
                  rows={3}
                  defaultValue={editingClient?.redirect_uris.join("\n") ?? ""}
                  required
                />
                <FieldDescription>
                  {oauthLocalization.redirectUrlsDescription}
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="oauth-client-uri">
                  {oauthLocalization.applicationUrl}
                </FieldLabel>
                <Input
                  id="oauth-client-uri"
                  name="clientUri"
                  type="url"
                  defaultValue={editingClient?.client_uri ?? ""}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="oauth-logo-uri">
                  {oauthLocalization.logoUrl}
                </FieldLabel>
                <Input
                  id="oauth-logo-uri"
                  name="logoUri"
                  type="url"
                  defaultValue={editingClient?.logo_uri ?? ""}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="oauth-scopes">
                  {oauthLocalization.scopes}
                </FieldLabel>
                <Input
                  id="oauth-scopes"
                  name="scope"
                  placeholder="openid profile email"
                  defaultValue={editingClient?.scope ?? ""}
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose
                type="button"
                className={buttonVariants({ variant: "outline" })}
              >
                {oauthLocalization.cancel}
              </DialogClose>
              <Button
                type="submit"
                disabled={createClient.isPending || updateClient.isPending}
              >
                {(createClient.isPending || updateClient.isPending) && (
                  <Spinner />
                )}
                {editingClient
                  ? oauthLocalization.saveChanges
                  : oauthLocalization.createClient}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(action)}
        onOpenChange={(open) => !open && setAction(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action?.kind === "delete"
                ? oauthLocalization.deleteClientTitle
                : oauthLocalization.rotateSecretTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action?.kind === "delete"
                ? oauthLocalization.deleteClientDescription
                : oauthLocalization.rotateSecretDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{oauthLocalization.cancel}</AlertDialogCancel>
            <Button
              type="button"
              variant={action?.kind === "delete" ? "destructive" : "default"}
              disabled={deleteClient.isPending || rotateSecret.isPending}
              onClick={confirmAction}
            >
              {(deleteClient.isPending || rotateSecret.isPending) && (
                <Spinner />
              )}
              {action?.kind === "delete"
                ? oauthLocalization.deleteClient
                : oauthLocalization.rotateSecret}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(secret)}
        onOpenChange={(open) => {
          if (!open) {
            setSecret(undefined)
            reset()
          }
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              <Code2 />
              {secret?.client_name || oauthLocalization.clientSecret}
            </DialogTitle>
            <DialogDescription>
              {oauthLocalization.clientSecretWarning}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="new-oauth-client-id">
                {oauthLocalization.clientId}
              </FieldLabel>
              <Input
                id="new-oauth-client-id"
                value={secret?.client_id ?? ""}
                readOnly
                className="font-mono text-xs"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="new-oauth-client-secret">
                {oauthLocalization.clientSecret}
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="new-oauth-client-secret"
                  value={secret?.client_secret ?? ""}
                  readOnly
                  className="font-mono text-xs"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    aria-label={
                      copied
                        ? localization.settings.copiedToClipboard
                        : localization.settings.copyToClipboard
                    }
                    onClick={() =>
                      secret?.client_secret && copy(secret.client_secret)
                    }
                  >
                    {copied ? <Check /> : <Copy />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              onClick={() => {
                setSecret(undefined)
                reset()
              }}
            >
              {oauthLocalization.continue}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function UserOAuthClients(
  props: Omit<OAuthClientsProps, "manager" | "owner" | "ownerKey">
) {
  const { authClient } = useAuth<OAuthProviderAuthClient>()
  const { clientManager } = useAuthPlugin(oauthProviderPlugin)
  const { data: session } = useSession(authClient)
  const defaultManager = useMemo(
    () => createBetterAuthOAuthClientManager(authClient),
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
