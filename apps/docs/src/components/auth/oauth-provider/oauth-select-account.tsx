"use client"

import type { ListDeviceSession } from "@better-auth-ui/core/plugins/multi-session"
import {
  type OAuthAuthorizationRequest,
  type OAuthProviderMultiSessionAuthClient,
  parseOAuthAuthorizationRequest,
  sanitizeOAuthClientUrl
} from "@better-auth-ui/core/plugins/oauth-provider"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useListDeviceSessions,
  useSetActiveSession
} from "@better-auth-ui/react/plugins/multi-session"
import {
  useOAuthContinue,
  usePublicOAuthClient
} from "@better-auth-ui/react/plugins/oauth-provider"
import { ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { oauthProviderPlugin } from "@/lib/auth/oauth-provider-plugin"
import { cn } from "@/lib/utils"
import { UserAvatar } from "../user/user-avatar"

export type OAuthSelectAccountProps = {
  className?: string
}

const interpolateClient = (template: string, clientName: string) =>
  template.replace("{{client}}", clientName)

/**
 * Account chooser for a signed OAuth authorization request.
 *
 * Switching accounts has to land before Better Auth resumes the request, so
 * picking a different session calls `multiSession.setActive()` first and only
 * then `oauth2.continue({ selected: true })`. Picking the account that is
 * already active skips the switch entirely.
 *
 * This screen deliberately has no sign-out or revoke actions — session
 * management belongs in security settings.
 */
export function OAuthSelectAccount({ className }: OAuthSelectAccountProps) {
  const { authClient } = useAuth()
  const { localization } = useAuthPlugin(oauthProviderPlugin)
  const oauthClient = authClient as OAuthProviderMultiSessionAuthClient

  const { data: session, isPending: isSessionPending } = useSession(oauthClient)
  const [request, setRequest] = useState<OAuthAuthorizationRequest>()
  const [pendingSessionId, setPendingSessionId] = useState<string>()

  useEffect(() => {
    setRequest(parseOAuthAuthorizationRequest(window.location.search))
  }, [])

  const publicClient = usePublicOAuthClient(oauthClient, request?.clientId, {
    enabled: Boolean(session && request?.clientId)
  })
  const { data: deviceSessions, isPending: isDeviceSessionsPending } =
    useListDeviceSessions(oauthClient)

  const client = publicClient.data
  const clientName = client?.client_name || localization.application
  const logoUrl = sanitizeOAuthClientUrl(client?.logo_uri)

  const setActiveSession = useSetActiveSession(oauthClient)
  const oauthContinue = useOAuthContinue(oauthClient)

  const requestResolved = request !== undefined
  const invalidRequest =
    requestResolved &&
    (!request.clientId ||
      (!isSessionPending && !session) ||
      publicClient.isError ||
      (!publicClient.isPending && session && !client))

  const selectAccount = async (
    deviceSession: ListDeviceSession<OAuthProviderMultiSessionAuthClient>
  ) => {
    setPendingSessionId(deviceSession.session.id)

    try {
      if (deviceSession.session.id !== session?.session.id) {
        await setActiveSession.mutateAsync({
          sessionToken: deviceSession.session.token
        })
      }

      await oauthContinue.mutateAsync({ selected: true })
    } catch {
      // The error toaster surfaces the failure; re-enable the rows so the
      // user can pick again.
      setPendingSessionId(undefined)
    }
  }

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

  const isBusy = pendingSessionId !== undefined

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
            {localization.selectAccount}
          </CardTitle>
          <CardDescription>
            {interpolateClient(
              localization.selectAccountDescription,
              clientName
            )}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {isDeviceSessionsPending ? (
          <ItemGroup>
            <Item variant="outline">
              <ItemMedia>
                <UserAvatar isPending />
              </ItemMedia>
              <ItemContent>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </ItemContent>
            </Item>
          </ItemGroup>
        ) : !deviceSessions?.length ? (
          <div className="flex flex-col items-center gap-1 py-6 text-center">
            <p className="text-sm font-semibold">{localization.noAccounts}</p>
            <p className="text-xs text-muted-foreground">
              {interpolateClient(
                localization.noAccountsDescription,
                clientName
              )}
            </p>
          </div>
        ) : (
          <ItemGroup className="gap-2">
            {deviceSessions.map((deviceSession) => {
              const isCurrent = deviceSession.session.id === session?.session.id
              const isSelecting = pendingSessionId === deviceSession.session.id

              return (
                <Item key={deviceSession.session.id} variant="outline">
                  <ItemMedia>
                    <UserAvatar user={deviceSession.user} />
                  </ItemMedia>

                  <ItemContent>
                    <ItemTitle className="truncate">
                      {deviceSession.user.name || deviceSession.user.email}
                    </ItemTitle>
                    {deviceSession.user.name ? (
                      <ItemDescription className="truncate">
                        {deviceSession.user.email}
                      </ItemDescription>
                    ) : null}
                  </ItemContent>

                  <ItemActions>
                    {isCurrent && (
                      <Badge variant="secondary">
                        {localization.currentAccount}
                      </Badge>
                    )}

                    <Button
                      size="sm"
                      disabled={isBusy}
                      onClick={() => selectAccount(deviceSession)}
                    >
                      {isSelecting && <Spinner />}

                      {localization.continue}
                    </Button>
                  </ItemActions>
                </Item>
              )
            })}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  )
}
