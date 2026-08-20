import {
  createBetterAuthOAuthClientManager,
  type ManagedOAuthClient,
  type OAuthClientInput,
  type OAuthClientManager,
  type OAuthClientOwner,
  type OAuthProviderAuthClient
} from "@better-auth-ui/core/plugins/oauth-provider"
import {
  createCopyToClipboard,
  useAuth,
  useAuthPlugin,
  useSession
} from "@better-auth-ui/solid"
import {
  useCreateOAuthClient,
  useDeleteOAuthClient,
  useOAuthClients,
  useRotateOAuthClientSecret,
  useSetOAuthClientDisabled,
  useUpdateOAuthClient
} from "@better-auth-ui/solid/plugins/oauth-provider"
import {
  Check,
  Code2,
  Copy,
  Pencil,
  Plus,
  RotateCcwKey,
  Trash2
} from "lucide-solid"
import { createMemo, createSignal, For, Match, Show, Switch } from "solid-js"
import { toast } from "solid-sonner"

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
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { NativeSelect } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { Switch as SwitchControl } from "@/components/ui/switch"
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
  class?: string
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

export function OAuthClients(props: OAuthClientsProps) {
  const auth = useAuth()
  const { localization: oauthLocalization } = useAuthPlugin(oauthProviderPlugin)

  const owner = () => props.owner
  const ownerKey = () => props.ownerKey

  const clients = useOAuthClients(props.manager, owner, ownerKey)
  const createClient = useCreateOAuthClient(props.manager, owner, ownerKey)
  const updateClient = useUpdateOAuthClient(props.manager, owner, ownerKey)
  const deleteClient = useDeleteOAuthClient(props.manager, owner, ownerKey)
  const rotateSecret = useRotateOAuthClientSecret(
    props.manager,
    owner,
    ownerKey
  )
  const setDisabled = useSetOAuthClientDisabled(props.manager, owner, ownerKey)

  const [editorOpen, setEditorOpen] = createSignal(false)
  const [editingClient, setEditingClient] = createSignal<ManagedOAuthClient>()
  const [action, setAction] = createSignal<ClientAction>()
  const [secret, setSecret] = createSignal<ManagedOAuthClient>()

  const { copied, copy, reset } = createCopyToClipboard({
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : String(error))
  })

  const openCreate = () => {
    setEditingClient(undefined)
    setEditorOpen(true)
  }

  const handleEditorSubmit = (event: SubmitEvent) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget as HTMLFormElement)

    const input: OAuthClientInput = {
      client_name: String(formData.get("clientName") ?? "").trim(),
      application_type:
        formData.get("applicationType") === "native" ? "native" : "web",
      redirect_uris: uniqueLines(String(formData.get("redirectUris") ?? "")),
      client_uri: String(formData.get("clientUri") ?? "").trim() || undefined,
      logo_uri: String(formData.get("logoUri") ?? "").trim() || undefined,
      scope: String(formData.get("scope") ?? "").trim() || undefined
    }

    const editing = editingClient()

    if (editing) {
      updateClient.mutate(
        { clientId: editing.client_id, update: input },
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
    const pending = action()
    if (!pending) return

    if (pending.kind === "delete") {
      deleteClient.mutate(pending.client.client_id, {
        onSuccess: () => setAction(undefined)
      })
      return
    }

    rotateSecret.mutate(pending.client.client_id, {
      onSuccess: (client) => {
        setAction(undefined)
        setSecret(client)
      }
    })
  }

  const isSaving = () => createClient.isPending || updateClient.isPending
  const isConfirming = () => deleteClient.isPending || rotateSecret.isPending

  return (
    <div class={cn("flex flex-col gap-3", props.class)}>
      <div class="flex items-end justify-between gap-3">
        <div class="flex min-w-0 flex-col gap-1">
          <h2 class="truncate text-sm font-semibold">
            {oauthLocalization.oauthClients}
          </h2>
          <p class="text-sm text-muted-foreground">
            {oauthLocalization.oauthClientsDescription}
          </p>
        </div>
        <Button
          class="shrink-0"
          disabled={clients.isPending}
          onClick={openCreate}
          size="sm"
        >
          <Plus data-icon="inline-start" />
          {oauthLocalization.createClient}
        </Button>
      </div>

      <Card class="p-0">
        <CardContent class="flex flex-col gap-0 p-0">
          <Switch>
            <Match when={clients.isPending}>
              <div class="flex min-h-28 items-center justify-center">
                <Spinner />
                <span class="sr-only">{oauthLocalization.oauthClients}</span>
              </div>
            </Match>

            <Match when={clients.data?.length}>
              <For each={clients.data}>
                {(client) => (
                  <div class="flex flex-col gap-3 border-b border-dashed p-4 last:border-0 sm:flex-row sm:items-start sm:justify-between">
                    <div class="flex min-w-0 gap-3">
                      <div class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Code2 class="size-4" />
                      </div>
                      <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                          <p class="truncate text-sm font-medium">
                            {client.client_name ||
                              oauthLocalization.application}
                          </p>
                          <Badge
                            variant={
                              client.disabled ? "destructive" : "secondary"
                            }
                          >
                            {client.disabled
                              ? oauthLocalization.disabled
                              : oauthLocalization.enabled}
                          </Badge>
                        </div>
                        <p class="mt-1 truncate font-mono text-xs text-muted-foreground">
                          {client.client_id}
                        </p>
                        <p class="mt-1 text-xs text-muted-foreground">
                          {client.redirect_uris.length}{" "}
                          {oauthLocalization.redirectUrls.toLowerCase()}
                        </p>
                      </div>
                    </div>

                    <div class="flex shrink-0 flex-wrap items-center gap-1">
                      <Show when={props.manager.setDisabled}>
                        <SwitchControl
                          aria-label={
                            client.disabled
                              ? oauthLocalization.disabled
                              : oauthLocalization.enabled
                          }
                          checked={!client.disabled}
                          disabled={setDisabled.isPending}
                          onChange={(enabled) =>
                            setDisabled.mutate({
                              clientId: client.client_id,
                              disabled: !enabled
                            })
                          }
                        />
                      </Show>

                      <Button
                        aria-label={oauthLocalization.editClient}
                        onClick={() => {
                          setEditingClient(client)
                          setEditorOpen(true)
                        }}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        aria-label={oauthLocalization.rotateSecret}
                        onClick={() => setAction({ kind: "rotate", client })}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <RotateCcwKey />
                      </Button>
                      <Button
                        aria-label={oauthLocalization.deleteClient}
                        onClick={() => setAction({ kind: "delete", client })}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                )}
              </For>
            </Match>

            <Match when={!clients.data?.length}>
              <div class="flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center">
                <div class="flex size-10 items-center justify-center rounded-xl bg-muted">
                  <Code2 />
                </div>
                <div class="flex max-w-sm flex-col gap-1">
                  <p class="text-sm font-medium">
                    {oauthLocalization.noOAuthClients}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    {oauthLocalization.noOAuthClientsDescription}
                  </p>
                </div>
                <Button onClick={openCreate} size="sm" variant="outline">
                  {oauthLocalization.createClient}
                </Button>
              </div>
            </Match>
          </Switch>
        </CardContent>
      </Card>

      <Dialog onOpenChange={setEditorOpen} open={editorOpen()}>
        <DialogContent>
          <form class="flex flex-col gap-6" onSubmit={handleEditorSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingClient()
                  ? oauthLocalization.editClient
                  : oauthLocalization.createClient}
              </DialogTitle>
              <DialogDescription>
                {oauthLocalization.oauthClientsDescription}
              </DialogDescription>
            </DialogHeader>

            <div class="flex flex-col gap-4">
              <Field>
                <FieldLabel for="oauth-client-name">
                  {oauthLocalization.clientName}
                </FieldLabel>
                <Input
                  id="oauth-client-name"
                  name="clientName"
                  required
                  value={editingClient()?.client_name ?? ""}
                />
              </Field>

              <Field>
                <FieldLabel for="oauth-application-type">
                  {oauthLocalization.applicationType}
                </FieldLabel>
                <NativeSelect
                  id="oauth-application-type"
                  name="applicationType"
                  value={editingClient()?.application_type ?? "web"}
                >
                  <option value="web">
                    {oauthLocalization.webApplication}
                  </option>
                  <option value="native">
                    {oauthLocalization.nativeApplication}
                  </option>
                </NativeSelect>
              </Field>

              <Field>
                <FieldLabel for="oauth-redirect-uris">
                  {oauthLocalization.redirectUrls}
                </FieldLabel>
                <Textarea
                  id="oauth-redirect-uris"
                  name="redirectUris"
                  required
                  rows={3}
                  value={editingClient()?.redirect_uris.join("\n") ?? ""}
                />
                <FieldDescription>
                  {oauthLocalization.redirectUrlsDescription}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel for="oauth-client-uri">
                  {oauthLocalization.applicationUrl}
                </FieldLabel>
                <Input
                  id="oauth-client-uri"
                  name="clientUri"
                  type="url"
                  value={editingClient()?.client_uri ?? ""}
                />
              </Field>

              <Field>
                <FieldLabel for="oauth-logo-uri">
                  {oauthLocalization.logoUrl}
                </FieldLabel>
                <Input
                  id="oauth-logo-uri"
                  name="logoUri"
                  type="url"
                  value={editingClient()?.logo_uri ?? ""}
                />
              </Field>

              <Field>
                <FieldLabel for="oauth-scopes">
                  {oauthLocalization.scopes}
                </FieldLabel>
                <Input
                  id="oauth-scopes"
                  name="scope"
                  placeholder="openid profile email"
                  value={editingClient()?.scope ?? ""}
                />
              </Field>
            </div>

            <DialogFooter>
              <Button
                onClick={() => setEditorOpen(false)}
                type="button"
                variant="outline"
              >
                {oauthLocalization.cancel}
              </Button>
              <Button disabled={isSaving()} type="submit">
                <Show when={isSaving()}>
                  <Spinner data-icon="inline-start" />
                </Show>
                {editingClient()
                  ? oauthLocalization.saveChanges
                  : oauthLocalization.createClient}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setAction(undefined)
        }}
        open={Boolean(action())}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action()?.kind === "delete"
                ? oauthLocalization.deleteClientTitle
                : oauthLocalization.rotateSecretTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action()?.kind === "delete"
                ? oauthLocalization.deleteClientDescription
                : oauthLocalization.rotateSecretDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>{oauthLocalization.cancel}</AlertDialogCancel>
            <Button
              disabled={isConfirming()}
              onClick={confirmAction}
              type="button"
              variant={action()?.kind === "delete" ? "destructive" : "default"}
            >
              <Show when={isConfirming()}>
                <Spinner data-icon="inline-start" />
              </Show>
              {action()?.kind === "delete"
                ? oauthLocalization.deleteClient
                : oauthLocalization.rotateSecret}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setSecret(undefined)
            reset()
          }
        }}
        open={Boolean(secret())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {secret()?.client_name || oauthLocalization.clientSecret}
            </DialogTitle>
            <DialogDescription>
              {oauthLocalization.clientSecretWarning}
            </DialogDescription>
          </DialogHeader>

          <div class="flex flex-col gap-4">
            <Field>
              <FieldLabel for="new-oauth-client-id">
                {oauthLocalization.clientId}
              </FieldLabel>
              <Input
                class="font-mono text-xs"
                id="new-oauth-client-id"
                readOnly
                value={secret()?.client_id ?? ""}
              />
            </Field>

            <Field>
              <FieldLabel for="new-oauth-client-secret">
                {oauthLocalization.clientSecret}
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  class="font-mono text-xs"
                  id="new-oauth-client-secret"
                  readOnly
                  value={secret()?.client_secret ?? ""}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    aria-label={
                      copied()
                        ? auth.localization.settings.copiedToClipboard
                        : auth.localization.settings.copyToClipboard
                    }
                    onClick={() => {
                      const clientSecret = secret()?.client_secret
                      if (clientSecret) void copy(clientSecret)
                    }}
                    size="icon-xs"
                    type="button"
                  >
                    {copied() ? <Check /> : <Copy />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </div>

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
  const auth = useAuth<OAuthProviderAuthClient>()
  const { clientManager } = useAuthPlugin(oauthProviderPlugin)
  const session = useSession(auth.authClient)
  const defaultManager = createMemo(() =>
    createBetterAuthOAuthClientManager(auth.authClient)
  )

  return (
    <OAuthClients
      class={props.class}
      manager={clientManager ?? defaultManager()}
      owner={{ type: "user" }}
      ownerKey={session.data?.user.id}
    />
  )
}

export function OrganizationOAuthClients(
  props: Omit<OAuthClientsProps, "manager" | "owner" | "ownerKey"> & {
    organizationId: string
    organizationSlug: string
  }
) {
  const { organizationClientManager } = useAuthPlugin(oauthProviderPlugin)

  return (
    <Show when={organizationClientManager}>
      {(manager) => (
        <OAuthClients
          class={props.class}
          manager={manager()}
          owner={{
            type: "organization",
            organizationId: props.organizationId,
            organizationSlug: props.organizationSlug
          }}
          ownerKey={`organization:${props.organizationId}:${props.organizationSlug}`}
        />
      )}
    </Show>
  )
}
