import {
  groupOAuthConsents,
  resolveOAuthScopeMetadata,
  type OAuthProviderAuthClient,
  type AuthorizedOAuthApplication
} from "@better-auth-ui/core/plugins/oauth-provider"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useListOAuthConsents,
  useDeleteOAuthConsent,
  usePublicOAuthClient
} from "@better-auth-ui/react/plugins/oauth-provider"
import { useState, useRef } from "react"
import { oauthProviderPlugin } from "../../../lib/auth/oauth-provider-plugin"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { useNativeLocale } from "../../../lib/native-locale"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"

export function AuthorizedApplications(props: CardSlotProps) {
  const { authClient } = useAuth()
  const { localization } = useAuthPlugin(oauthProviderPlugin)
  const consents = useListOAuthConsents(authClient as OAuthProviderAuthClient)
  const applications = groupOAuthConsents(consents.data)
  return (
    <Box className={props.className ?? "gap-4"}>
      <Txt className="font-semibold">{localization.connectedApplications}</Txt>
      <Description>{localization.connectedApplicationsDescription}</Description>
      {consents.isPending ? <Skeleton className="h-20 w-full" /> : null}
      {consents.error ? (
        <Txt accessibilityRole="alert">{consents.error.message}</Txt>
      ) : null}
      {consents.data && applications.length === 0 ? (
        <Description>{localization.noConnectedApplications}</Description>
      ) : null}
      {applications.map((application) => (
        <AuthorizedApplication
          key={application.clientId}
          application={application}
          variant={props.variant}
        />
      ))}
    </Box>
  )
}

function AuthorizedApplication({
  application,
  variant
}: CardSlotProps & { application: AuthorizedOAuthApplication }) {
  const { authClient } = useAuth()
  const { localization, scopeMetadata } = useAuthPlugin(oauthProviderPlugin)
  const { languageTag } = useNativeLocale()
  const metadata = usePublicOAuthClient(
    authClient as OAuthProviderAuthClient,
    application.clientId
  )
  const remove = useDeleteOAuthConsent(authClient as OAuthProviderAuthClient)
  const completed = useRef(new Set<string>())
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  return (
    <Card variant={variant}>
      <Card.Header>
        <Card.Title>
          {metadata.data?.client_name || application.clientId}
        </Card.Title>
      </Card.Header>
      <Card.Content className="gap-3">
        {application.scopes.map((scope) => {
          const details = resolveOAuthScopeMetadata(scopeMetadata, scope, {
            clientId: application.clientId,
            requestedScopes: application.scopes
          })
          return (
            <Box key={scope}>
              <Txt>{details.label}</Txt>
              {details.description ? (
                <Description>{details.description}</Description>
              ) : null}
            </Box>
          )
        })}
        {application.updatedAt ? (
          <Description>
            {localization.lastAuthorized}:{" "}
            {new Intl.DateTimeFormat(languageTag, {
              dateStyle: "medium"
            }).format(application.updatedAt)}
          </Description>
        ) : null}
        <Button
          variant="danger"
          onPress={() => {
            setError("")
            setConfirm(true)
          }}
        >
          {localization.removeAuthorization}
        </Button>
      </Card.Content>
      <AlertDialog
        isOpen={confirm}
        onOpenChange={(open) => {
          if (!busy) setConfirm(open)
        }}
      >
        <AlertDialog.Header>
          <AlertDialog.Heading>
            {localization.removeAuthorizationTitle}
          </AlertDialog.Heading>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <Description>
            {localization.removeAuthorizationDescription}
          </Description>
          {error ? <Txt accessibilityRole="alert">{error}</Txt> : null}
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <Button isDisabled={busy} onPress={() => setConfirm(false)}>
            {localization.cancel}
          </Button>
          <Button
            variant="danger"
            isPending={busy}
            onPress={() => {
              setBusy(true)
              void (async () => {
                try {
                  for (const id of application.consentIds) {
                    if (completed.current.has(id)) continue
                    await remove.mutateAsync({ id })
                    completed.current.add(id)
                  }
                  setConfirm(false)
                } catch (error) {
                  setError((error as Error).message)
                } finally {
                  setBusy(false)
                }
              })()
            }}
          >
            {localization.remove}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog>
    </Card>
  )
}
