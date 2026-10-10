"use client"

import {
  getOAuthAuthorizationDestination,
  type OAuthProviderAuthClient,
  parseOAuthAuthorizationRequest,
  resolveOAuthScopeMetadata,
  sanitizeOAuthClientUrl
} from "@better-auth-ui/core/plugins/oauth-provider"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useOAuthConsent,
  usePublicOAuthClient
} from "@better-auth-ui/react/plugins/oauth-provider"
import { Check, Ellipsis, Link as LinkIcon, Square } from "@gravity-ui/icons"
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
import { useSyncExternalStore } from "react"

import { oauthProviderPlugin } from "../../../lib/auth/oauth-provider-plugin"
import { UserAvatar } from "../user/user-avatar"

export type OAuthConsentProps = {
  className?: string
  /** The complete signed query. Pass it from your router for same-page navigation. */
  oauthQuery?: string
  variant?: CardProps["variant"]
}

const subscribeToQuery = (onChange: () => void) => {
  window.addEventListener("popstate", onChange)
  return () => window.removeEventListener("popstate", onChange)
}

const interpolateClient = (template: string, clientName: string) =>
  template.replace("{{client}}", clientName)

export function OAuthConsent({
  className,
  variant,
  oauthQuery
}: OAuthConsentProps) {
  const { authClient } = useAuth()
  const { localization, scopeMetadata } = useAuthPlugin(oauthProviderPlugin)
  const oauthClient = authClient as OAuthProviderAuthClient
  const { data: session, isPending: isSessionPending } = useSession(oauthClient)
  const browserQuery = useSyncExternalStore(
    subscribeToQuery,
    () => window.location.search,
    () => undefined
  )
  const query = oauthQuery ?? browserQuery
  const request =
    query === undefined ? undefined : parseOAuthAuthorizationRequest(query)
  const publicClient = usePublicOAuthClient(oauthClient, request?.clientId, {
    enabled: Boolean(session && request?.clientId),
    oauthQuery: query,
    retry: false,
    staleTime: 0,
    gcTime: 0
  })
  const consent = useOAuthConsent(oauthClient)
  const client =
    !publicClient.isFetching && !publicClient.isError
      ? publicClient.data
      : undefined
  const destination =
    client && query ? getOAuthAuthorizationDestination(query) : undefined
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
      (!publicClient.isPending &&
        !publicClient.isFetching &&
        session &&
        !client))
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
        <div className="flex items-center justify-center gap-5">
          {client ? (
            <Avatar className="size-16">
              <Avatar.Image
                alt={clientName}
                referrerPolicy="no-referrer"
                src={logoUrl}
              />
              <Avatar.Fallback>
                <Square className="size-7" />
              </Avatar.Fallback>
            </Avatar>
          ) : (
            <Skeleton className="size-16 rounded-full" />
          )}
          <Ellipsis aria-hidden="true" className="size-5 text-muted" />
          <UserAvatar
            className="size-16"
            isPending={isSessionPending}
            user={session?.user}
          />
        </div>
        <div className="grid justify-items-center gap-1 text-center">
          <Card.Title className="max-w-full break-words text-xl font-semibold">
            {client ? clientName : <Skeleton className="h-6 w-36" />}
          </Card.Title>
          <Card.Description>
            {localization.authorizationRequest}
          </Card.Description>
          <div className="mt-2 flex max-w-full flex-wrap justify-center gap-x-1 text-sm text-muted">
            <span>{localization.signedInAs}</span>
            {session ? (
              <span className="break-all font-medium">
                {session.user.name || session.user.email}
              </span>
            ) : (
              <Skeleton className="h-4 w-32" />
            )}
          </div>
        </div>
      </Card.Header>

      <Card.Content className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">
            {interpolateClient(localization.requestedPermissions, clientName)}
          </p>

          {client && request ? (
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

        {destination ? (
          <div className="flex gap-2 text-xs text-muted">
            <LinkIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>
              {localization.redirectTo}{" "}
              <span className="block break-all font-medium text-foreground">
                {destination}
              </span>
            </p>
          </div>
        ) : null}
        <p className="text-xs text-muted">
          {localization.applicationInformation}
        </p>

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
          onPress={() => consent.mutate({ accept: false, oauth_query: query })}
        >
          {consent.isPending && consent.variables?.accept === false ? (
            <Spinner color="current" size="sm" />
          ) : null}
          {localization.cancel}
        </Button>
        <Button
          isDisabled={!canRespond}
          isPending={consent.isPending && consent.variables?.accept === true}
          onPress={() => consent.mutate({ accept: true, oauth_query: query })}
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
