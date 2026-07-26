"use client"

import {
  type OAuthAuthorizationRequest,
  parseOAuthAuthorizationRequest,
  resolveOAuthScopeMetadata,
  sanitizeOAuthClientUrl
} from "@better-auth-ui/core/plugins"
import {
  type OAuthProviderAuthClient,
  useAuth,
  useAuthPlugin,
  useOAuthConsent,
  usePublicOAuthClient,
  useSession
} from "@better-auth-ui/react"
import { Check, Shield } from "@gravity-ui/icons"
import {
  Avatar,
  Button,
  Card,
  type CardProps,
  cn,
  Link,
  Skeleton,
  Spinner
} from "@heroui/react"
import { useEffect, useState } from "react"

import { oauthProviderPlugin } from "../../../lib/auth/oauth-provider-plugin"
import { UserAvatar } from "../user/user-avatar"

export type OAuthConsentProps = {
  className?: string
  variant?: CardProps["variant"]
}

const interpolateClient = (template: string, clientName: string) =>
  template.replace("{{client}}", clientName)

export function OAuthConsent({ className, variant }: OAuthConsentProps) {
  const { authClient } = useAuth()
  const { localization, scopeMetadata } = useAuthPlugin(oauthProviderPlugin)
  const oauthClient = authClient as OAuthProviderAuthClient
  const { data: session, isPending: isSessionPending } = useSession(oauthClient)
  const [request, setRequest] = useState<OAuthAuthorizationRequest>()

  useEffect(() => {
    setRequest(parseOAuthAuthorizationRequest(window.location.search))
  }, [])

  const publicClient = usePublicOAuthClient(oauthClient, request?.clientId, {
    enabled: Boolean(session && request?.clientId)
  })
  const consent = useOAuthConsent(oauthClient)
  const client = publicClient.data
  const clientName = client?.client_name || localization.application
  const logoUrl = sanitizeOAuthClientUrl(client?.logo_uri)
  const policyUrl = sanitizeOAuthClientUrl(client?.policy_uri)
  const termsUrl = sanitizeOAuthClientUrl(client?.tos_uri)
  const requestResolved = request !== undefined
  const invalidRequest =
    requestResolved &&
    (!request.clientId ||
      (!isSessionPending && !session) ||
      publicClient.isError ||
      (!publicClient.isPending && session && !client))
  const canRespond = Boolean(
    request?.clientId && session && client && !consent.isPending
  )
  const cardClassName = cn("w-full max-w-md gap-5 md:p-6", className)

  if (invalidRequest) {
    return (
      <Card className={cardClassName} variant={variant}>
        <Card.Header>
          <Card.Title className="text-xl font-semibold">
            {localization.invalidRequest}
          </Card.Title>
          <Card.Description>
            {localization.invalidRequestDescription}
          </Card.Description>
        </Card.Header>
      </Card>
    )
  }

  return (
    <Card className={cardClassName} variant={variant}>
      <Card.Header className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {client ? (
            <Avatar size="lg">
              <Avatar.Image
                alt={clientName}
                referrerPolicy="no-referrer"
                src={logoUrl}
              />
              <Avatar.Fallback>
                <Shield className="size-5" />
              </Avatar.Fallback>
            </Avatar>
          ) : (
            <Skeleton className="size-12 rounded-full" />
          )}

          <div className="min-w-0 flex-1">
            {client ? (
              <p className="truncate font-medium">{clientName}</p>
            ) : (
              <Skeleton className="h-4 w-36" />
            )}
            {client?.client_uri ? (
              <p className="truncate text-xs text-muted">{client.client_uri}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Card.Title className="text-xl font-semibold">
            {interpolateClient(localization.authorize, clientName)}
          </Card.Title>
          <Card.Description>
            {interpolateClient(
              localization.authorizationDescription,
              clientName
            )}
          </Card.Description>
        </div>
      </Card.Header>

      <Card.Content className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">
            {interpolateClient(localization.requestedPermissions, clientName)}
          </p>

          {request ? (
            <ul className="flex flex-col gap-3">
              {request.scopes.map((scope) => {
                const metadata = resolveOAuthScopeMetadata(
                  scopeMetadata,
                  scope,
                  {
                    clientId: request.clientId,
                    requestedScopes: request.scopes
                  }
                )

                return (
                  <li className="flex gap-3" key={scope}>
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium">{metadata.label}</p>
                      {metadata.description ? (
                        <p className="text-xs text-muted">
                          {metadata.description}
                        </p>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="flex gap-3">
              <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full max-w-64" />
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-separator" />

        <div className="flex items-center gap-3">
          <UserAvatar
            isPending={isSessionPending}
            size="md"
            user={session?.user}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">{localization.signedInAs}</p>
            {session ? (
              <>
                <p className="truncate text-sm font-medium">
                  {session.user.name || session.user.email}
                </p>
                {session.user.name ? (
                  <p className="truncate text-xs text-muted">
                    {session.user.email}
                  </p>
                ) : null}
              </>
            ) : (
              <Skeleton className="mt-1 h-4 w-40" />
            )}
          </div>
        </div>

        {policyUrl || termsUrl ? (
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {policyUrl ? (
              <Link
                className="text-muted"
                href={policyUrl}
                rel="noreferrer"
                target="_blank"
              >
                {localization.privacyPolicy}
              </Link>
            ) : null}
            {termsUrl ? (
              <Link
                className="text-muted"
                href={termsUrl}
                rel="noreferrer"
                target="_blank"
              >
                {localization.termsOfService}
              </Link>
            ) : null}
          </div>
        ) : null}
      </Card.Content>

      <Card.Footer className="grid grid-cols-2 gap-2">
        <Button
          isDisabled={!canRespond}
          isPending={consent.isPending && consent.variables?.accept === false}
          variant="outline"
          onPress={() => consent.mutate({ accept: false })}
        >
          {consent.isPending && consent.variables?.accept === false ? (
            <Spinner color="current" size="sm" />
          ) : null}
          {localization.cancel}
        </Button>
        <Button
          isDisabled={!canRespond}
          isPending={consent.isPending && consent.variables?.accept === true}
          onPress={() => consent.mutate({ accept: true })}
        >
          {consent.isPending && consent.variables?.accept === true ? (
            <Spinner color="current" size="sm" />
          ) : null}
          {localization.allow}
        </Button>
      </Card.Footer>
    </Card>
  )
}
