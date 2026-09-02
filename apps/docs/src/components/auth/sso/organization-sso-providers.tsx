"use client"

import {
  hasMemberRole,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import type {
  SsoAuthClient,
  SsoProvider,
  UpdateSsoProviderParams
} from "@better-auth-ui/core/plugins/sso"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useActiveMemberRole } from "@better-auth-ui/react/plugins/organization"
import {
  useDeleteSsoProvider,
  useSsoProviders,
  useUpdateSsoProvider
} from "@better-auth-ui/react/plugins/sso"
import type { BetterFetchError } from "better-auth/client"
import { PencilIcon, Trash2Icon } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
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
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { ssoPlugin } from "@/lib/auth/sso-plugin"
import { cn } from "@/lib/utils"
import { useAuthForm } from "../auth-form"

import { SsoDomainVerification } from "./sso-domain-verification"
import { SsoProviderSetup } from "./sso-provider-setup"

export type OrganizationSsoProvidersProps = {
  className?: string
  organizationId: string
  organizationSlug: string
}

const providerSkeletonIds = ["sso-provider-1", "sso-provider-2"]

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

/** Manage the SSO providers that belong to one explicit organization. */
export function OrganizationSsoProviders({
  className,
  organizationId,
  organizationSlug: _organizationSlug
}: OrganizationSsoProvidersProps) {
  const { authClient } = useAuth()
  const { localization } = useAuthPlugin(ssoPlugin)
  const { creatorRole } = useAuthPlugin(organizationPlugin)
  const memberRole = useActiveMemberRole(authClient as OrganizationAuthClient, {
    query: { organizationId }
  })
  const canManage =
    hasMemberRole(memberRole.data?.role, creatorRole) ||
    hasMemberRole(memberRole.data?.role, "admin")
  const providersQuery = useSsoProviders(authClient as SsoAuthClient, {
    enabled: !memberRole.isPending && canManage
  })
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<SsoProvider>()
  const [verifying, setVerifying] = useState<SsoProvider>()
  const [deleting, setDeleting] = useState<SsoProvider>()
  const providers = useMemo(
    () =>
      providersQuery.data?.providers.filter(
        (provider) => provider.organizationId === organizationId
      ) ?? [],
    [organizationId, providersQuery.data?.providers]
  )

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{localization.providerList}</CardTitle>
        <CardDescription>
          {localization.providerListDescription}
        </CardDescription>
        <CardAction>
          <Button
            disabled={memberRole.isPending || !canManage}
            onClick={() => setCreating((open) => !open)}
            size="sm"
          >
            {localization.addProvider}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {creating ? (
          <SsoProviderSetup
            className="max-w-none"
            organizationId={organizationId}
            onRegistered={() => setCreating(false)}
          />
        ) : null}

        {memberRole.isPending || (canManage && providersQuery.isPending) ? (
          <div className="flex flex-col gap-2">
            {providerSkeletonIds.map((id) => (
              <Skeleton className="h-24 w-full" key={id} />
            ))}
          </div>
        ) : !canManage ? (
          <div
            className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm"
            role="alert"
          >
            {localization.providerAccessDenied}
          </div>
        ) : providersQuery.error ? (
          <div
            className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
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
        ) : providers.length ? (
          <div className="flex flex-col gap-2">
            {providers.map((provider) => (
              <div
                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                key={provider.providerId}
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{provider.providerId}</span>
                    <Badge variant="outline">
                      {provider.type.toUpperCase()}
                    </Badge>
                    <Badge
                      variant={
                        provider.domainVerified ? "secondary" : "outline"
                      }
                    >
                      {provider.domainVerified
                        ? localization.domainVerified
                        : localization.verifyDomain}
                    </Badge>
                  </div>
                  <span className="truncate text-sm text-muted-foreground">
                    {provider.domain} · {provider.issuer}
                  </span>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {!provider.domainVerified ? (
                    <Button
                      onClick={() => setVerifying(provider)}
                      size="sm"
                      variant="outline"
                    >
                      {localization.verifyDomain}
                    </Button>
                  ) : null}
                  <Button
                    aria-label={localization.editProvider}
                    onClick={() => setEditing(provider)}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    aria-label={localization.deleteProvider}
                    onClick={() => setDeleting(provider)}
                    size="icon-sm"
                    variant="destructive"
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty className="min-h-32 border">
            <EmptyHeader>
              <EmptyTitle>{localization.noProviders}</EmptyTitle>
              <EmptyDescription>
                {localization.noProvidersDescription}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>

      <EditSsoProviderDialog
        key={editing?.providerId ?? "closed"}
        onOpenChange={setEditing}
        provider={editing}
      />
      <DeleteSsoProviderDialog onOpenChange={setDeleting} provider={deleting} />
      <Dialog
        open={Boolean(verifying)}
        onOpenChange={(open) => !open && setVerifying(undefined)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{localization.domainVerification}</DialogTitle>
          </DialogHeader>
          {verifying ? (
            <SsoDomainVerification
              className="max-w-none shadow-none ring-0"
              defaultProviderId={verifying.providerId}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function EditSsoProviderDialog({
  onOpenChange,
  provider
}: {
  onOpenChange: (provider: SsoProvider | undefined) => void
  provider?: SsoProvider
}) {
  const { authClient } = useAuth()
  const { localization } = useAuthPlugin(ssoPlugin)
  const update = useUpdateSsoProvider(authClient as SsoAuthClient)

  const close = () => {
    update.reset()
    onOpenChange(undefined)
  }
  const form = useAuthForm({
    defaultValues: getSsoProviderEditorValues(provider),
    onSubmit: async ({ value }) => {
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
  })

  return (
    <Dialog
      open={Boolean(provider)}
      onOpenChange={(open) => {
        if (!open && !update.isPending) close()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>{localization.editProvider}</DialogTitle>
            <DialogDescription>{provider?.providerId}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            {(
              [
                ["domain", "sso-edit-domain", localization.domain, "text"],
                ["issuer", "sso-edit-issuer", localization.issuer, "url"]
              ] as const
            ).map(([name, id, label, type]) => (
              <form.Field key={name} name={name}>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={id}>{label}</FieldLabel>
                    <Input
                      id={id}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      required
                      type={type}
                      value={field.state.value}
                    />
                  </Field>
                )}
              </form.Field>
            ))}
            {provider?.oidcConfig ? (
              <>
                <form.Field name="discoveryEndpoint">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="sso-edit-discovery">
                        {localization.discoveryEndpoint}
                      </FieldLabel>
                      <Input
                        id="sso-edit-discovery"
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        type="url"
                        value={field.state.value}
                      />
                    </Field>
                  )}
                </form.Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      ["clientId", "sso-edit-client-id", localization.clientId],
                      [
                        "clientSecret",
                        "sso-edit-client-secret",
                        localization.clientSecret
                      ]
                    ] as const
                  ).map(([name, id, label]) => (
                    <form.Field key={name} name={name}>
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={id}>{label}</FieldLabel>
                          <Input
                            autoComplete={
                              name === "clientSecret"
                                ? "new-password"
                                : undefined
                            }
                            id={id}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            placeholder={
                              name === "clientId"
                                ? `••••${provider.oidcConfig?.clientIdLastFour}`
                                : undefined
                            }
                            type={name === "clientSecret" ? "password" : "text"}
                            value={field.state.value}
                          />
                        </Field>
                      )}
                    </form.Field>
                  ))}
                </div>
              </>
            ) : null}
            {provider?.samlConfig ? (
              <>
                <form.Field name="entryPoint">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="sso-edit-entry-point">
                        {localization.entryPoint}
                      </FieldLabel>
                      <Input
                        id="sso-edit-entry-point"
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        required
                        type="url"
                        value={field.state.value}
                      />
                    </Field>
                  )}
                </form.Field>
                <form.Field name="identityProviderMetadata">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="sso-edit-metadata">
                        {localization.identityProviderMetadata}
                      </FieldLabel>
                      <Textarea
                        className="font-mono text-xs"
                        id="sso-edit-metadata"
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        rows={6}
                        value={field.state.value}
                      />
                    </Field>
                  )}
                </form.Field>
              </>
            ) : null}
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
            <form.Subscribe
              selector={(state) =>
                [state.canSubmit, state.isSubmitting] as const
              }
            >
              {([canSubmit, isSubmitting]) => (
                <Button disabled={!canSubmit || isSubmitting} type="submit">
                  {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                  {localization.saveProvider}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteSsoProviderDialog({
  onOpenChange,
  provider
}: {
  onOpenChange: (provider: SsoProvider | undefined) => void
  provider?: SsoProvider
}) {
  const { authClient } = useAuth()
  const { localization } = useAuthPlugin(ssoPlugin)
  const remove = useDeleteSsoProvider(authClient as SsoAuthClient)
  const close = () => {
    remove.reset()
    onOpenChange(undefined)
  }

  return (
    <AlertDialog
      open={Boolean(provider)}
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
        <p className="font-mono text-xs">{provider?.providerId}</p>
        <FieldError>{getErrorMessage(remove.error)}</FieldError>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>
            {localization.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={remove.isPending}
            onClick={(event) => {
              event.preventDefault()
              if (!provider) return
              remove.mutate(
                { providerId: provider.providerId },
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
