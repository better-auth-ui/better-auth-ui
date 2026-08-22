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
import { type FormEvent, useMemo, useState } from "react"
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
import { ssoPlugin } from "@/lib/auth/sso-plugin"
import { cn } from "@/lib/utils"

import { SsoDomainVerification } from "./sso-domain-verification"
import { SsoProviderSetup } from "./sso-provider-setup"

export type OrganizationSsoProvidersProps = {
  className?: string
  organizationId: string
  organizationSlug: string
}

const providerSkeletonIds = ["sso-provider-1", "sso-provider-2"]

const readString = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim()

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
  const memberRole = useActiveMemberRole(authClient as OrganizationAuthClient, {
    query: { organizationId }
  })
  const canManage =
    hasMemberRole(memberRole.data?.role, "owner") ||
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

      <EditSsoProviderDialog onOpenChange={setEditing} provider={editing} />
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
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!provider) return
    const data = new FormData(event.currentTarget)
    const clientId = readString(data, "clientId")
    const clientSecret = readString(data, "clientSecret")
    const identityProviderMetadata = readString(
      data,
      "identityProviderMetadata"
    )
    const params = {
      providerId: provider.providerId,
      issuer: readString(data, "issuer"),
      domain: readString(data, "domain"),
      ...(provider.oidcConfig
        ? {
            oidcConfig: {
              ...(clientId ? { clientId } : {}),
              ...(clientSecret ? { clientSecret } : {}),
              discoveryEndpoint:
                readString(data, "discoveryEndpoint") || undefined
            }
          }
        : {}),
      ...(provider.samlConfig
        ? {
            samlConfig: {
              entryPoint: readString(data, "entryPoint"),
              ...(identityProviderMetadata
                ? { idpMetadata: { metadata: identityProviderMetadata } }
                : {})
            }
          }
        : {})
    } as UpdateSsoProviderParams

    update.mutate(params, {
      onSuccess: () => {
        toast.success(localization.providerUpdated)
        close()
      }
    })
  }

  return (
    <Dialog
      open={Boolean(provider)}
      onOpenChange={(open) => {
        if (!open && !update.isPending) close()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{localization.editProvider}</DialogTitle>
            <DialogDescription>{provider?.providerId}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="sso-edit-domain">
                {localization.domain}
              </FieldLabel>
              <Input
                defaultValue={provider?.domain}
                id="sso-edit-domain"
                name="domain"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="sso-edit-issuer">
                {localization.issuer}
              </FieldLabel>
              <Input
                defaultValue={provider?.issuer}
                id="sso-edit-issuer"
                name="issuer"
                required
                type="url"
              />
            </Field>
            {provider?.oidcConfig ? (
              <>
                <Field>
                  <FieldLabel htmlFor="sso-edit-discovery">
                    {localization.discoveryEndpoint}
                  </FieldLabel>
                  <Input
                    defaultValue={provider.oidcConfig.discoveryEndpoint}
                    id="sso-edit-discovery"
                    name="discoveryEndpoint"
                    type="url"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="sso-edit-client-id">
                      {localization.clientId}
                    </FieldLabel>
                    <Input
                      id="sso-edit-client-id"
                      name="clientId"
                      placeholder={`••••${provider.oidcConfig.clientIdLastFour}`}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="sso-edit-client-secret">
                      {localization.clientSecret}
                    </FieldLabel>
                    <Input
                      autoComplete="new-password"
                      id="sso-edit-client-secret"
                      name="clientSecret"
                      type="password"
                    />
                  </Field>
                </div>
              </>
            ) : null}
            {provider?.samlConfig ? (
              <>
                <Field>
                  <FieldLabel htmlFor="sso-edit-entry-point">
                    {localization.entryPoint}
                  </FieldLabel>
                  <Input
                    defaultValue={provider.samlConfig.entryPoint}
                    id="sso-edit-entry-point"
                    name="entryPoint"
                    required
                    type="url"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="sso-edit-metadata">
                    {localization.identityProviderMetadata}
                  </FieldLabel>
                  <Textarea
                    className="font-mono text-xs"
                    id="sso-edit-metadata"
                    name="identityProviderMetadata"
                    rows={6}
                  />
                </Field>
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
            <Button disabled={update.isPending} type="submit">
              {update.isPending ? <Spinner data-icon="inline-start" /> : null}
              {localization.saveProvider}
            </Button>
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
