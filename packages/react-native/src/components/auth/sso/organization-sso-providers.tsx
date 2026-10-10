import {
  hasMemberRole,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import type {
  SsoAuthClient,
  SsoProvider
} from "@better-auth-ui/core/plugins/sso"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useActiveMemberRole } from "@better-auth-ui/react/plugins/organization"
import {
  useSsoProviders,
  useDeleteSsoProvider
} from "@better-auth-ui/react/plugins/sso"
import { useState } from "react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { ssoPlugin } from "../../../lib/auth/sso-plugin"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"
import { SsoProviderSetup } from "./sso-provider-setup"
import { SsoDomainVerification } from "./sso-domain-verification"

export function OrganizationSsoProviders({
  organizationId,
  organizationSlug: _slug,
  ...props
}: CardSlotProps & { organizationId: string; organizationSlug: string }) {
  const { authClient } = useAuth()
  const { creatorRole } = useAuthPlugin(organizationPlugin)
  const { localization } = useAuthPlugin(ssoPlugin)
  const role = useActiveMemberRole(authClient as OrganizationAuthClient, {
    query: { organizationId }
  })
  const allowed =
    hasMemberRole(role.data?.role, creatorRole) ||
    hasMemberRole(role.data?.role, "admin")
  const providers = useSsoProviders(authClient as SsoAuthClient, {
    enabled: allowed
  })
  const remove = useDeleteSsoProvider(authClient as SsoAuthClient)
  const [editor, setEditor] = useState<true | SsoProvider>()
  const [verification, setVerification] = useState<SsoProvider>()
  const [deleting, setDeleting] = useState<SsoProvider>()
  const scoped = providers.data?.providers.filter(
    (provider) => provider.organizationId === organizationId
  )
  return (
    <Box className={props.className ?? "gap-4"}>
      <Txt className="font-semibold">{localization.providerList}</Txt>
      <Description>{localization.providerListDescription}</Description>
      <Button isDisabled={!allowed} onPress={() => setEditor(true)}>
        {localization.addProvider}
      </Button>
      {role.isPending || (allowed && providers.isPending) ? (
        <Skeleton className="h-20 w-full" />
      ) : !allowed ? (
        <Description>{localization.providerAccessDenied}</Description>
      ) : null}
      {providers.error ? (
        <>
          <Txt accessibilityRole="alert">{localization.providerLoadError}</Txt>
          <Button
            onPress={() => {
              void providers.refetch()
            }}
          >
            {localization.retry}
          </Button>
        </>
      ) : null}
      {scoped?.length === 0 ? (
        <Description>{localization.noProvidersDescription}</Description>
      ) : null}
      {scoped?.map((provider) => (
        <Card key={provider.providerId} variant={props.variant}>
          <Card.Content className="gap-3">
            <Txt className="font-medium">{provider.providerId}</Txt>
            <Description>
              {provider.type.toUpperCase()} · {provider.domain}
            </Description>
            <Description>{provider.issuer}</Description>
            <Description>
              {provider.domainVerified
                ? localization.domainVerified
                : localization.verifyDomain}
            </Description>
            <Button onPress={() => setVerification(provider)}>
              {localization.verifyDomain}
            </Button>
            <Button onPress={() => setEditor(provider)}>
              {localization.editProvider}
            </Button>
            <Button
              variant="danger"
              onPress={() => {
                remove.reset()
                setDeleting(provider)
              }}
            >
              {localization.deleteProvider}
            </Button>
          </Card.Content>
        </Card>
      ))}
      {editor && allowed ? (
        <AlertDialog
          isOpen
          onOpenChange={(open) => {
            if (!open) setEditor(undefined)
          }}
        >
          <AlertDialog.CloseTrigger />
          <SsoProviderSetup
            key={editor === true ? "new" : editor.providerId}
            organizationId={organizationId}
            provider={editor === true ? undefined : editor}
            onSaved={() => setEditor(undefined)}
          />
        </AlertDialog>
      ) : null}
      {verification && allowed ? (
        <AlertDialog
          isOpen
          onOpenChange={(open) => {
            if (!open) setVerification(undefined)
          }}
        >
          <AlertDialog.CloseTrigger />
          <SsoDomainVerification
            key={verification.providerId}
            defaultProviderId={verification.providerId}
          />
        </AlertDialog>
      ) : null}
      <AlertDialog
        isOpen={!!deleting}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setDeleting(undefined)
        }}
      >
        <AlertDialog.Header>
          <AlertDialog.Heading>
            {localization.deleteProvider}
          </AlertDialog.Heading>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <Description>{localization.deleteProviderDescription}</Description>
          {remove.error ? (
            <Txt accessibilityRole="alert">{remove.error.message}</Txt>
          ) : null}
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <Button
            isDisabled={remove.isPending}
            onPress={() => setDeleting(undefined)}
          >
            {localization.cancel}
          </Button>
          <Button
            variant="danger"
            isPending={remove.isPending}
            isDisabled={!allowed}
            onPress={() => {
              if (deleting?.organizationId === organizationId)
                remove.mutate(
                  { providerId: deleting.providerId },
                  { onSuccess: () => setDeleting(undefined) }
                )
            }}
          >
            {localization.deleteProvider}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog>
    </Box>
  )
}
