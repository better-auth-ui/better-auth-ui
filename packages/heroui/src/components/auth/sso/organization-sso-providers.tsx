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
import { Pencil, TrashBin } from "@gravity-ui/icons"
import {
  Alert,
  AlertDialog,
  Button,
  Card,
  type CardProps,
  Chip,
  cn,
  FieldError,
  Form,
  Input,
  Label,
  Skeleton,
  TextArea,
  TextField,
  toast
} from "@heroui/react"
import type { BetterFetchError } from "better-auth/client"
import { type FormEvent, useMemo, useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { ssoPlugin } from "../../../lib/auth/sso-plugin"
import { SsoDomainVerification } from "./sso-domain-verification"
import { SsoProviderSetup } from "./sso-provider-setup"

export type OrganizationSsoProvidersProps = {
  organizationId: string
  organizationSlug: string
} & Omit<CardProps, "children">

const providerSkeletonIds = ["sso-provider-1", "sso-provider-2"]

const readString = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim()

const getErrorMessage = (error: Error | null) => {
  const authError = error as BetterFetchError | null
  return authError?.error?.message ?? authError?.message
}

export function OrganizationSsoProviders({
  className,
  organizationId,
  organizationSlug: _organizationSlug,
  variant,
  ...props
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
    <Card className={cn(className)} variant={variant} {...props}>
      <Card.Header className="flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Card.Title>{localization.providerList}</Card.Title>
          <Card.Description>
            {localization.providerListDescription}
          </Card.Description>
        </div>
        <Button
          isDisabled={memberRole.isPending || !canManage}
          size="sm"
          onPress={() => setCreating((open) => !open)}
        >
          {localization.addProvider}
        </Button>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        {creating ? (
          <SsoProviderSetup
            organizationId={organizationId}
            variant="transparent"
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
          <Alert data-access-denied status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                {localization.providerAccessDenied}
              </Alert.Description>
            </Alert.Content>
          </Alert>
        ) : providersQuery.error ? (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                {localization.providerLoadError}
              </Alert.Description>
            </Alert.Content>
            <Button
              size="sm"
              variant="outline"
              onPress={() => providersQuery.refetch()}
            >
              {localization.retry}
            </Button>
          </Alert>
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
                    <Chip size="sm" variant="secondary">
                      {provider.type.toUpperCase()}
                    </Chip>
                    <Chip
                      color={provider.domainVerified ? "success" : "warning"}
                      size="sm"
                    >
                      {provider.domainVerified
                        ? localization.domainVerified
                        : localization.verifyDomain}
                    </Chip>
                  </div>
                  <span className="truncate text-sm text-muted">
                    {provider.domain} · {provider.issuer}
                  </span>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {!provider.domainVerified ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => setVerifying(provider)}
                    >
                      {localization.verifyDomain}
                    </Button>
                  ) : null}
                  <Button
                    isIconOnly
                    aria-label={localization.editProvider}
                    size="sm"
                    variant="tertiary"
                    onPress={() => setEditing(provider)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    isIconOnly
                    aria-label={localization.deleteProvider}
                    size="sm"
                    variant="danger-soft"
                    onPress={() => setDeleting(provider)}
                  >
                    <TrashBin />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-32 flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm font-medium">{localization.noProviders}</p>
            <p className="text-xs text-muted">
              {localization.noProvidersDescription}
            </p>
          </div>
        )}
      </Card.Content>

      <EditSsoProviderDialog provider={editing} onOpenChange={setEditing} />
      <DeleteSsoProviderDialog provider={deleting} onOpenChange={setDeleting} />
      <AlertDialog.Backdrop
        isOpen={Boolean(verifying)}
        onOpenChange={(open) => !open && setVerifying(undefined)}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="max-w-xl">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Heading>
                {localization.domainVerification}
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              {verifying ? (
                <SsoDomainVerification
                  defaultProviderId={verifying.providerId}
                  variant="transparent"
                />
              ) : null}
            </AlertDialog.Body>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
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
    <AlertDialog.Backdrop
      isOpen={Boolean(provider)}
      onOpenChange={(open) => {
        if (!open && !update.isPending) close()
      }}
    >
      <AlertDialog.Container>
        <AlertDialog.Dialog className="max-w-xl">
          <Form onSubmit={submit}>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Heading>
                {localization.editProvider}
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body className="flex flex-col gap-4 overflow-visible">
              <TextField
                defaultValue={provider?.domain}
                isRequired
                name="domain"
              >
                <Label>{localization.domain}</Label>
                <Input variant="secondary" />
                <FieldError />
              </TextField>
              <TextField
                defaultValue={provider?.issuer}
                isRequired
                name="issuer"
              >
                <Label>{localization.issuer}</Label>
                <Input type="url" variant="secondary" />
                <FieldError />
              </TextField>
              {provider?.oidcConfig ? (
                <>
                  <TextField name="discoveryEndpoint">
                    <Label>{localization.discoveryEndpoint}</Label>
                    <Input
                      defaultValue={provider.oidcConfig.discoveryEndpoint}
                      type="url"
                      variant="secondary"
                    />
                  </TextField>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField name="clientId">
                      <Label>{localization.clientId}</Label>
                      <Input
                        placeholder={`••••${provider.oidcConfig.clientIdLastFour}`}
                        variant="secondary"
                      />
                    </TextField>
                    <TextField name="clientSecret" type="password">
                      <Label>{localization.clientSecret}</Label>
                      <Input autoComplete="new-password" variant="secondary" />
                    </TextField>
                  </div>
                </>
              ) : null}
              {provider?.samlConfig ? (
                <>
                  <TextField isRequired name="entryPoint">
                    <Label>{localization.entryPoint}</Label>
                    <Input
                      defaultValue={provider.samlConfig.entryPoint}
                      type="url"
                      variant="secondary"
                    />
                    <FieldError />
                  </TextField>
                  <TextField name="identityProviderMetadata">
                    <Label>{localization.identityProviderMetadata}</Label>
                    <TextArea className="font-mono text-xs" rows={6} />
                  </TextField>
                </>
              ) : null}
              {update.error ? (
                <FieldError>{getErrorMessage(update.error)}</FieldError>
              ) : null}
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button
                isDisabled={update.isPending}
                slot="close"
                variant="tertiary"
              >
                {localization.cancel}
              </Button>
              <Button isPending={update.isPending} type="submit">
                {localization.saveProvider}
              </Button>
            </AlertDialog.Footer>
          </Form>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
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
    <AlertDialog.Backdrop
      isOpen={Boolean(provider)}
      onOpenChange={(open) => {
        if (!open && !remove.isPending) close()
      }}
    >
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Icon status="danger">
              <TrashBin />
            </AlertDialog.Icon>
            <AlertDialog.Heading>
              {localization.deleteProvider}
            </AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body className="flex flex-col gap-2">
            <p className="text-sm text-muted">
              {localization.deleteProviderDescription}
            </p>
            <p className="font-mono text-xs">{provider?.providerId}</p>
            {remove.error ? (
              <FieldError>{getErrorMessage(remove.error)}</FieldError>
            ) : null}
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button
              isDisabled={remove.isPending}
              slot="close"
              variant="tertiary"
            >
              {localization.cancel}
            </Button>
            <Button
              isPending={remove.isPending}
              variant="danger"
              onPress={() =>
                provider &&
                remove.mutate(
                  { providerId: provider.providerId },
                  {
                    onSuccess: () => {
                      toast.success(localization.providerDeleted)
                      close()
                    }
                  }
                )
              }
            >
              {localization.deleteProvider}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
