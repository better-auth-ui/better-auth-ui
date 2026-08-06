"use client"

import {
  type OAuthAuthorizationRequest,
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
import { Check, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"

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
import { cn } from "@/lib/utils"
import { UserAvatar } from "../user/user-avatar"

export type OAuthConsentProps = {
  className?: string
}

const interpolateClient = (template: string, clientName: string) =>
  template.replace("{{client}}", clientName)

export function OAuthConsent({ className }: OAuthConsentProps) {
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

  if (invalidRequest) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader>
          <CardTitle className="text-xl">
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
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="gap-4">
        <div className="flex items-center gap-3">
          {client ? (
            <Avatar size="lg">
              <AvatarImage
                alt={clientName}
                referrerPolicy="no-referrer"
                src={logoUrl}
              />
              <AvatarFallback>
                <ShieldCheck className="size-5" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <Skeleton className="size-10 rounded-full" />
          )}

          <div className="min-w-0 flex-1">
            {client ? (
              <p className="truncate font-medium">{clientName}</p>
            ) : (
              <Skeleton className="h-4 w-36" />
            )}
            {client?.client_uri ? (
              <p className="truncate text-xs text-muted-foreground">
                {client.client_uri}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-1">
          <CardTitle className="text-xl">
            {interpolateClient(localization.authorize, clientName)}
          </CardTitle>
          <CardDescription>
            {interpolateClient(
              localization.authorizationDescription,
              clientName
            )}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-3">
          <p className="text-sm font-medium">
            {interpolateClient(localization.requestedPermissions, clientName)}
          </p>

          {request ? (
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
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="grid gap-0.5">
                      <p className="text-sm font-medium">{metadata.label}</p>
                      {metadata.description ? (
                        <p className="text-xs text-muted-foreground">
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

        <div className="flex items-center gap-3">
          <UserAvatar isPending={isSessionPending} user={session?.user} />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">
              {localization.signedInAs}
            </p>
            {session ? (
              <>
                <p className="truncate text-sm font-medium">
                  {session.user.name || session.user.email}
                </p>
                {session.user.name ? (
                  <p className="truncate text-xs text-muted-foreground">
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
              <a
                className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                href={policyUrl}
                rel="noreferrer"
                target="_blank"
              >
                {localization.privacyPolicy}
              </a>
            ) : null}
            {termsUrl ? (
              <a
                className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                href={termsUrl}
                rel="noreferrer"
                target="_blank"
              >
                {localization.termsOfService}
              </a>
            ) : null}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2">
        <Button
          disabled={!canRespond}
          variant="outline"
          onClick={() => consent.mutate({ accept: false })}
        >
          {consent.isPending && consent.variables?.accept === false ? (
            <Spinner />
          ) : null}
          {localization.cancel}
        </Button>
        <Button
          disabled={!canRespond}
          onClick={() => consent.mutate({ accept: true })}
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
