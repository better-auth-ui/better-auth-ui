import { validateAbsoluteUrl, validateStringLength } from "@better-auth-ui/core"
import {
  hasMemberRole,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import type {
  SsoAuthClient,
  SsoProvider,
  UpdateSsoProviderParams
} from "@better-auth-ui/core/plugins/sso"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useActiveMemberRole } from "@better-auth-ui/solid/plugins/organization"
import {
  useDeleteSsoProvider,
  useSsoProviders,
  useUpdateSsoProvider
} from "@better-auth-ui/solid/plugins/sso"
import type { BetterFetchError } from "better-auth/client"
import { Pencil, Trash2 } from "lucide-solid"
import { createEffect, createMemo, createSignal, For, on, Show } from "solid-js"
import { toast } from "solid-sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@/components/ui/empty"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { ssoPlugin } from "@/lib/auth/sso-plugin"
import { cn } from "@/lib/utils"
import { createAuthForm, isAuthFormFieldInvalid } from "../auth-form"

import { SsoDomainVerification } from "./sso-domain-verification"
import { SsoProviderSetup } from "./sso-provider-setup"

export type OrganizationSsoProvidersProps = {
  class?: string
  organizationId: string
  organizationSlug: string
}

const providerSkeletonIds = ["solid-sso-provider-1", "solid-sso-provider-2"]

type SsoProviderEditorValues = {
  clientId: string
  clientSecret: string
  discoveryEndpoint: string
  domain: string
  entryPoint: string
  identityProviderMetadata: string
  issuer: string
}

const getSsoProviderEditorValues = (
  provider?: SsoProvider
): SsoProviderEditorValues => ({
  clientId: "",
  clientSecret: "",
  discoveryEndpoint: provider?.oidcConfig?.discoveryEndpoint ?? "",
  domain: provider?.domain ?? "",
  entryPoint: provider?.samlConfig?.entryPoint ?? "",
  identityProviderMetadata: "",
  issuer: provider?.issuer ?? ""
})

const getErrorMessage = (error: Error | null) => {
  const authError = error as BetterFetchError | null
  return authError?.error?.message ?? authError?.message
}

export function OrganizationSsoProviders(props: OrganizationSsoProvidersProps) {
  const auth = useAuth()
  const { localization } = useAuthPlugin(ssoPlugin)
  const { creatorRole } = useAuthPlugin(organizationPlugin)
  const memberRole = useActiveMemberRole(
    auth.authClient as OrganizationAuthClient,
    () => ({ query: { organizationId: props.organizationId } })
  )
  const canManage = () =>
    hasMemberRole(memberRole.data?.role, creatorRole) ||
    hasMemberRole(memberRole.data?.role, "admin")
  const providersQuery = useSsoProviders(
    auth.authClient as SsoAuthClient,
    () => ({ enabled: !memberRole.isPending && canManage() })
  )
  const [creating, setCreating] = createSignal(false)
  const [editing, setEditing] = createSignal<SsoProvider>()
  const [verifying, setVerifying] = createSignal<SsoProvider>()
  const [deleting, setDeleting] = createSignal<SsoProvider>()
  const providers = createMemo(
    () =>
      providersQuery.data?.providers.filter(
        (provider) => provider.organizationId === props.organizationId
      ) ?? []
  )

  return (
    <Card class={cn(props.class)}>
      <CardHeader>
        <CardTitle>{localization.providerList}</CardTitle>
        <CardDescription>
          {localization.providerListDescription}
        </CardDescription>
        <CardAction>
          <Button
            disabled={memberRole.isPending || !canManage()}
            onClick={() => setCreating((open) => !open)}
            size="sm"
          >
            {localization.addProvider}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <Show when={creating()}>
          <SsoProviderSetup
            class="max-w-none"
            organizationId={props.organizationId}
            onRegistered={() => setCreating(false)}
          />
        </Show>
        <Show
          fallback={
            <div class="flex flex-col gap-2">
              <For each={providerSkeletonIds}>
                {(id) => <Skeleton class="h-24 w-full" data-id={id} />}
              </For>
            </div>
          }
          when={
            !memberRole.isPending && (!canManage() || !providersQuery.isPending)
          }
        >
          <Show
            fallback={
              <div
                class="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm"
                role="alert"
              >
                {localization.providerAccessDenied}
              </div>
            }
            when={canManage()}
          >
            <Show
              fallback={
                <div
                  class="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
                  role="alert"
                >
                  <span>{localization.providerLoadError}</span>
                  <Button
                    onClick={() => providersQuery.refetch()}
                    size="sm"
                    variant="outline"
                  >
                    {localization.retry}
                  </Button>
                </div>
              }
              when={!providersQuery.error}
            >
              <Show
                fallback={
                  <Empty class="min-h-32 border">
                    <EmptyHeader>
                      <EmptyTitle>{localization.noProviders}</EmptyTitle>
                      <EmptyDescription>
                        {localization.noProvidersDescription}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                }
                when={providers().length}
              >
                <div class="flex flex-col gap-2">
                  <For each={providers()}>
                    {(provider) => (
                      <div class="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex min-w-0 flex-col gap-1">
                          <div class="flex flex-wrap items-center gap-2">
                            <span class="font-medium">
                              {provider.providerId}
                            </span>
                            <Badge variant="outline">
                              {provider.type.toUpperCase()}
                            </Badge>
                            <Badge
                              variant={
                                provider.domainVerified
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {provider.domainVerified
                                ? localization.domainVerified
                                : localization.verifyDomain}
                            </Badge>
                          </div>
                          <span class="truncate text-sm text-muted-foreground">
                            {provider.domain} · {provider.issuer}
                          </span>
                        </div>
                        <div class="flex shrink-0 flex-wrap gap-2">
                          <Show when={!provider.domainVerified}>
                            <Button
                              onClick={() => setVerifying(provider)}
                              size="sm"
                              variant="outline"
                            >
                              {localization.verifyDomain}
                            </Button>
                          </Show>
                          <Button
                            aria-label={localization.editProvider}
                            onClick={() => setEditing(provider)}
                            size="icon-sm"
                            variant="ghost"
                          >
                            <Pencil />
                          </Button>
                          <Button
                            aria-label={localization.deleteProvider}
                            onClick={() => setDeleting(provider)}
                            size="icon-sm"
                            variant="destructive"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </Show>
          </Show>
        </Show>
      </CardContent>

      <EditSsoProviderDialog onOpenChange={setEditing} provider={editing()} />
      <DeleteSsoProviderDialog
        onOpenChange={setDeleting}
        provider={deleting()}
      />
      <Dialog
        open={Boolean(verifying())}
        onOpenChange={(open) => !open && setVerifying(undefined)}
      >
        <DialogContent class="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{localization.domainVerification}</DialogTitle>
          </DialogHeader>
          <Show when={verifying()}>
            {(provider) => (
              <SsoDomainVerification
                class="max-w-none shadow-none ring-0"
                defaultProviderId={provider().providerId}
              />
            )}
          </Show>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function EditSsoProviderDialog(props: {
  onOpenChange: (provider: SsoProvider | undefined) => void
  provider?: SsoProvider
}) {
  const auth = useAuth()
  const { localization } = useAuthPlugin(ssoPlugin)
  const update = useUpdateSsoProvider(auth.authClient as SsoAuthClient)
  const close = () => {
    update.reset()
    props.onOpenChange(undefined)
  }
  const form = createAuthForm(() => ({
    defaultValues: getSsoProviderEditorValues(props.provider),
    onSubmit: async ({ value }) => {
      const provider = props.provider
      if (!provider) return
      const clientId = value.clientId.trim()
      const clientSecret = value.clientSecret.trim()
      const identityProviderMetadata = value.identityProviderMetadata.trim()
      const params = {
        providerId: provider.providerId,
        issuer: value.issuer.trim(),
        domain: value.domain.trim(),
        ...(provider.oidcConfig
          ? {
              oidcConfig: {
                ...(clientId ? { clientId } : {}),
                ...(clientSecret ? { clientSecret } : {}),
                discoveryEndpoint: value.discoveryEndpoint.trim() || undefined
              }
            }
          : {}),
        ...(provider.samlConfig
          ? {
              samlConfig: {
                entryPoint: value.entryPoint.trim(),
                ...(identityProviderMetadata
                  ? { idpMetadata: { metadata: identityProviderMetadata } }
                  : {})
              }
            }
          : {})
      } as UpdateSsoProviderParams
      try {
        await update.mutateAsync(params)
        toast.success(localization.providerUpdated)
        close()
      } catch {
        // The mutation error is rendered below the fields.
      }
    }
  }))
  createEffect(
    on(
      () => props.provider,
      (provider) => form.reset(getSsoProviderEditorValues(provider)),
      { defer: true }
    )
  )

  return (
    <Dialog
      open={Boolean(props.provider)}
      onOpenChange={(open) => {
        if (!open && !update.isPending) close()
      }}
    >
      <DialogContent class="max-h-[90vh] max-w-xl overflow-y-auto">
        <form.AppForm>
          <form.AuthFormRoot class="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{localization.editProvider}</DialogTitle>
              <DialogDescription>
                {props.provider?.providerId}
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <form.AppField
                name="domain"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(value, {
                      requiredMessage: auth.localization.auth.fieldRequired,
                      trim: true
                    })
                }}
              >
                {(field) => {
                  const isInvalid = () =>
                    isAuthFormFieldInvalid(field().state.meta)

                  return (
                    <Field data-invalid={isInvalid()}>
                      <FieldLabel for="solid-sso-edit-domain">
                        {localization.domain}
                      </FieldLabel>
                      <Input
                        id="solid-sso-edit-domain"
                        name={field().name}
                        onBlur={field().handleBlur}
                        onInput={(event) =>
                          field().handleChange(event.currentTarget.value)
                        }
                        required
                        value={field().state.value}
                        aria-invalid={isInvalid()}
                      />
                      <field.AuthFormFieldError />
                    </Field>
                  )
                }}
              </form.AppField>
              <form.AppField
                name="issuer"
                validators={{
                  onChange: ({ value }) =>
                    validateAbsoluteUrl(value, {
                      invalidMessage: localization.invalidUrl,
                      requiredMessage: auth.localization.auth.fieldRequired
                    })
                }}
              >
                {(field) => {
                  const isInvalid = () =>
                    isAuthFormFieldInvalid(field().state.meta)

                  return (
                    <Field data-invalid={isInvalid()}>
                      <FieldLabel for="solid-sso-edit-issuer">
                        {localization.issuer}
                      </FieldLabel>
                      <Input
                        id="solid-sso-edit-issuer"
                        name={field().name}
                        onBlur={field().handleBlur}
                        onInput={(event) =>
                          field().handleChange(event.currentTarget.value)
                        }
                        required
                        type="url"
                        value={field().state.value}
                        aria-invalid={isInvalid()}
                      />
                      <field.AuthFormFieldError />
                    </Field>
                  )
                }}
              </form.AppField>
              <Show when={props.provider?.oidcConfig}>
                {(oidc) => (
                  <>
                    <form.AppField
                      name="discoveryEndpoint"
                      validators={{
                        onChange: ({ value }) =>
                          validateAbsoluteUrl(value, {
                            invalidMessage: localization.invalidUrl
                          })
                      }}
                    >
                      {(field) => {
                        const isInvalid = () =>
                          isAuthFormFieldInvalid(field().state.meta)

                        return (
                          <Field data-invalid={isInvalid()}>
                            <FieldLabel for="solid-sso-edit-discovery">
                              {localization.discoveryEndpoint}
                            </FieldLabel>
                            <Input
                              id="solid-sso-edit-discovery"
                              name={field().name}
                              onBlur={field().handleBlur}
                              onInput={(event) =>
                                field().handleChange(event.currentTarget.value)
                              }
                              type="url"
                              value={field().state.value}
                              aria-invalid={isInvalid()}
                            />
                            <field.AuthFormFieldError />
                          </Field>
                        )
                      }}
                    </form.AppField>
                    <div class="grid gap-4 sm:grid-cols-2">
                      <form.Field name="clientId">
                        {(field) => (
                          <Field>
                            <FieldLabel for="solid-sso-edit-client-id">
                              {localization.clientId}
                            </FieldLabel>
                            <Input
                              id="solid-sso-edit-client-id"
                              name={field().name}
                              onBlur={field().handleBlur}
                              onInput={(event) =>
                                field().handleChange(event.currentTarget.value)
                              }
                              placeholder={`••••${oidc().clientIdLastFour}`}
                              value={field().state.value}
                            />
                          </Field>
                        )}
                      </form.Field>
                      <form.Field name="clientSecret">
                        {(field) => (
                          <Field>
                            <FieldLabel for="solid-sso-edit-client-secret">
                              {localization.clientSecret}
                            </FieldLabel>
                            <Input
                              autocomplete="new-password"
                              id="solid-sso-edit-client-secret"
                              name={field().name}
                              onBlur={field().handleBlur}
                              onInput={(event) =>
                                field().handleChange(event.currentTarget.value)
                              }
                              type="password"
                              value={field().state.value}
                            />
                          </Field>
                        )}
                      </form.Field>
                    </div>
                  </>
                )}
              </Show>
              <Show when={props.provider?.samlConfig}>
                <form.AppField
                  name="entryPoint"
                  validators={{
                    onChange: ({ value }) =>
                      validateAbsoluteUrl(value, {
                        invalidMessage: localization.invalidUrl,
                        requiredMessage: auth.localization.auth.fieldRequired
                      })
                  }}
                >
                  {(field) => {
                    const isInvalid = () =>
                      isAuthFormFieldInvalid(field().state.meta)

                    return (
                      <Field data-invalid={isInvalid()}>
                        <FieldLabel for="solid-sso-edit-entry-point">
                          {localization.entryPoint}
                        </FieldLabel>
                        <Input
                          id="solid-sso-edit-entry-point"
                          name={field().name}
                          onBlur={field().handleBlur}
                          onInput={(event) =>
                            field().handleChange(event.currentTarget.value)
                          }
                          required
                          type="url"
                          value={field().state.value}
                          aria-invalid={isInvalid()}
                        />
                        <field.AuthFormFieldError />
                      </Field>
                    )
                  }}
                </form.AppField>
                <form.Field name="identityProviderMetadata">
                  {(field) => (
                    <Field>
                      <FieldLabel for="solid-sso-edit-metadata">
                        {localization.identityProviderMetadata}
                      </FieldLabel>
                      <Textarea
                        class="font-mono text-xs"
                        id="solid-sso-edit-metadata"
                        name={field().name}
                        onBlur={field().handleBlur}
                        onInput={(event) =>
                          field().handleChange(event.currentTarget.value)
                        }
                        rows={6}
                        value={field().state.value}
                      />
                    </Field>
                  )}
                </form.Field>
              </Show>
            </FieldGroup>
            <FieldError>{getErrorMessage(update.error)}</FieldError>
            <DialogFooter>
              <Button
                disabled={update.isPending}
                onClick={close}
                type="button"
                variant="outline"
              >
                {localization.cancel}
              </Button>
              <form.AuthFormSubmitButton disabled={update.isPending}>
                {localization.saveProvider}
              </form.AuthFormSubmitButton>
            </DialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}

function DeleteSsoProviderDialog(props: {
  onOpenChange: (provider: SsoProvider | undefined) => void
  provider?: SsoProvider
}) {
  const auth = useAuth()
  const { localization } = useAuthPlugin(ssoPlugin)
  const remove = useDeleteSsoProvider(auth.authClient as SsoAuthClient)
  const close = () => {
    remove.reset()
    props.onOpenChange(undefined)
  }

  return (
    <AlertDialog
      open={Boolean(props.provider)}
      onOpenChange={(open) => {
        if (!open && !remove.isPending) close()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{localization.deleteProvider}</AlertDialogTitle>
          <AlertDialogDescription>
            {localization.deleteProviderDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p class="font-mono text-xs">{props.provider?.providerId}</p>
        <FieldError>{getErrorMessage(remove.error)}</FieldError>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>
            {localization.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={remove.isPending}
            onClick={(event: MouseEvent) => {
              event.preventDefault()
              if (!props.provider) return
              remove.mutate(
                { providerId: props.provider.providerId },
                {
                  onSuccess: () => {
                    toast.success(localization.providerDeleted)
                    close()
                  }
                }
              )
            }}
            variant="destructive"
          >
            {localization.deleteProvider}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
