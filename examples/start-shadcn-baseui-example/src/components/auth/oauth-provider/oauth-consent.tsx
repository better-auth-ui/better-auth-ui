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
import {
  AppWindow,
  Check,
  Ellipsis,
  Link as LinkIcon,
  Shield
} from "lucide-react"
import { useSyncExternalStore } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { oauthProviderPlugin } from "@/lib/auth/oauth-provider-plugin"
import { cn } from "cn"
import { UserAvatar } from "../user/user-avatar"

export type OAuthConsentProps = {
  className?: string
  /** The complete signed query. Pass it from your router for same-page navigation. */
  oauthQuery?: string
}

const subscribeToQuery = (onChange: () => void) => {
  window.addEventListener("popstate", onChange)
  return () => window.removeEventListener("popstate", onChange)
}

const interpolateClient = (template: string, clientName: string) =>
  template.replace("{{client}}", clientName)

export function OAuthConsent({ className, oauthQuery }: OAuthConsentProps) {
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

  if (invalidRequest) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader>
          <CardTitle role="heading" aria-level={2} className="text-xl">
            {localization.invalidRequest}
          </CardTitle>
          <CardDescription>
            {localization.invalidRequestDescription}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "max-h-[calc(100dvh-2rem)] w-full max-w-lg gap-0 py-0",
        className
      )}
    >
      <div
        className="min-h-0 overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        role="region"
        aria-label={interpolateClient(localization.authorize, clientName)}
        tabIndex={0}
      >
        <CardHeader className="gap-5 p-6">
          <div className="flex items-center justify-center gap-5">
            {client ? (
              <Avatar className="size-16">
                <AvatarImage
                  alt={clientName}
                  referrerPolicy="no-referrer"
                  src={logoUrl}
                />
                <AvatarFallback>
                  <AppWindow className="size-7" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Skeleton className="size-16 rounded-full" />
            )}
            <Ellipsis
              aria-hidden="true"
              className="size-5 text-muted-foreground"
            />
            <UserAvatar
              className="size-16"
              isPending={isSessionPending}
              user={session?.user}
            />
          </div>
          <div className="grid justify-items-center gap-1 text-center">
            <CardTitle
              role="heading"
              aria-level={2}
              className="max-w-full break-words text-xl font-semibold"
            >
              {client ? clientName : <Skeleton className="h-6 w-36" />}
            </CardTitle>
            <CardDescription>
              {localization.authorizationRequest}
            </CardDescription>
            <div className="mt-2 flex max-w-full flex-wrap justify-center gap-x-1 text-sm text-muted-foreground">
              <span>{localization.signedInAs}</span>
              {session ? (
                <span className="break-all font-medium text-foreground">
                  {session.user.name || session.user.email}
                </span>
              ) : (
                <Skeleton className="h-4 w-32" />
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-6 sm:px-6">
          <div className="flex flex-col gap-5 rounded-lg bg-muted/50 p-5">
            <div className="grid gap-3">
              <p className="text-sm font-medium">
                {interpolateClient(
                  localization.requestedPermissions,
                  clientName
                )}
              </p>

              {client && request ? (
                <ul className="grid gap-3">
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
                        <Check
                          aria-hidden="true"
                          className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                        />
                        <div className="grid min-w-0 gap-1">
                          <p className="text-base leading-6 break-words">
                            {metadata.label}
                          </p>
                          {metadata.description ? (
                            <p className="text-sm leading-5 text-muted-foreground">
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
                  <div className="grid flex-1 gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full max-w-64" />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {destination ? (
              <div className="flex gap-3 text-sm leading-5 text-muted-foreground">
                <LinkIcon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
                <p>
                  {localization.redirectTo}{" "}
                  <span className="block break-all font-medium text-foreground">
                    {destination}
                  </span>
                </p>
              </div>
            ) : null}
            {policyUrl || termsUrl ? (
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {policyUrl ? (
                  <a
                    className="text-primary underline underline-offset-4"
                    href={policyUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {localization.privacyPolicy}
                  </a>
                ) : null}
                {termsUrl ? (
                  <a
                    className="text-primary underline underline-offset-4"
                    href={termsUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {localization.termsOfService}
                  </a>
                ) : null}
              </div>
            ) : null}
            <div className="flex gap-3 text-sm leading-5 text-muted-foreground">
              <Shield aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>{localization.applicationInformation}</p>
            </div>
          </div>
        </CardContent>
      </div>

      <CardFooter className="grid shrink-0 grid-cols-2 gap-3 p-4 sm:p-6">
        <Button
          className="h-11"
          disabled={!canRespond}
          variant="secondary"
          onClick={() => consent.mutate({ accept: false, oauth_query: query })}
        >
          {consent.isPending && consent.variables?.accept === false ? (
            <Spinner />
          ) : null}
          {localization.cancel}
        </Button>
        <Button
          className="h-11"
          disabled={!canRespond}
          onClick={() => consent.mutate({ accept: true, oauth_query: query })}
        >
          {consent.isPending && consent.variables?.accept === true ? (
            <Spinner />
          ) : null}
          {localization.allow}
        </Button>
      </CardFooter>
    </Card>
  )
}
