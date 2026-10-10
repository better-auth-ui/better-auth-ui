"use client"

import type { ListDeviceSession } from "@better-auth-ui/core/plugins/multi-session"
import type { OAuthProviderMultiSessionAuthClient } from "@better-auth-ui/core/plugins/oauth-provider"
import {
  type OAuthAuthorizationRequest,
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
import { ShieldCheck, ChevronRight } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { oauthProviderPlugin } from "@/lib/auth/oauth-provider-plugin"
import { cn } from "cn"
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
    <Card
      className={cn(
        "max-h-[calc(100dvh-2rem)] w-full max-w-lg gap-0 overflow-y-auto py-0",
        className
      )}
    >
      <CardHeader className="grid justify-items-center gap-5 p-6 text-center">
        <div className="grid justify-items-center gap-3">
          {client ? (
            <Avatar className="size-16">
              <AvatarImage
                alt={clientName}
                referrerPolicy="no-referrer"
                src={logoUrl}
              />
              <AvatarFallback>
                <ShieldCheck className="size-7" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <Skeleton className="size-16 rounded-full" />
          )}
          {client ? (
            <p className="max-w-full break-words text-base font-medium">
              {clientName}
            </p>
          ) : (
            <Skeleton className="h-5 w-36" />
          )}
        </div>
        <div className="grid gap-1">
          <CardTitle className="text-xl font-semibold">
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
      <CardContent className="px-4 pb-6 sm:px-6">
        {isDeviceSessionsPending ? (
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
            <UserAvatar isPending />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ) : !deviceSessions?.length ? (
          <div className="grid justify-items-center gap-1 py-6 text-center">
            <p className="text-sm font-semibold">{localization.noAccounts}</p>
            <p className="text-sm text-muted-foreground">
              {interpolateClient(
                localization.noAccountsDescription,
                clientName
              )}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-lg bg-muted/50">
            {deviceSessions.map((deviceSession) => {
              const isCurrent = deviceSession.session.id === session?.session.id
              const isSelecting = pendingSessionId === deviceSession.session.id
              return (
                <li key={deviceSession.session.id}>
                  <Button
                    className="h-auto min-h-20 w-full justify-start gap-3 rounded-none p-4 text-left whitespace-normal"
                    variant="ghost"
                    disabled={isBusy || !client || isSessionPending}
                    aria-label={`${localization.continue}: ${deviceSession.user.name || deviceSession.user.email} (${deviceSession.user.email})`}
                    onClick={() => selectAccount(deviceSession)}
                  >
                    <UserAvatar
                      className="size-10 shrink-0"
                      user={deviceSession.user}
                    />
                    <span className="grid min-w-0 flex-1 gap-0.5">
                      <span className="break-words text-base font-medium">
                        {deviceSession.user.name || deviceSession.user.email}
                      </span>
                      {deviceSession.user.name ? (
                        <span className="break-all text-sm text-muted-foreground">
                          {deviceSession.user.email}
                        </span>
                      ) : null}
                    </span>
                    {isCurrent ? (
                      <Badge className="shrink-0" variant="secondary">
                        {localization.currentAccount}
                      </Badge>
                    ) : null}
                    {isSelecting ? (
                      <Spinner />
                    ) : (
                      <ChevronRight
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted-foreground"
                      />
                    )}
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
