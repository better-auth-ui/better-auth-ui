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
import { Shield } from "@gravity-ui/icons"
import {
  Avatar,
  Card,
  type CardProps,
  Chip,
  cn,
  Description,
  Label,
  ListBox,
  Skeleton,
  Spinner
} from "@heroui/react"
import { useEffect, useState } from "react"

import { oauthProviderPlugin } from "../../../lib/auth/oauth-provider-plugin"
import { UserAvatar } from "../user/user-avatar"

export type OAuthSelectAccountProps = {
  className?: string
  variant?: CardProps["variant"]
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
export function OAuthSelectAccount({
  className,
  variant
}: OAuthSelectAccountProps) {
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

  const cardClassName = cn("w-full max-w-md gap-5 md:p-6", className)

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

  const isBusy = pendingSessionId !== undefined

  return (
    <Card
      className={cn(
        "max-h-[calc(100dvh-2rem)] w-full max-w-lg gap-0 overflow-y-auto p-0",
        className
      )}
      variant={variant}
    >
      <Card.Header className="grid justify-items-center gap-5 p-6 text-center">
        <div className="grid justify-items-center gap-3">
          {client ? (
            <Avatar className="size-16">
              <Avatar.Image
                alt={clientName}
                referrerPolicy="no-referrer"
                src={logoUrl}
              />
              <Avatar.Fallback>
                <Shield className="size-7" />
              </Avatar.Fallback>
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
          <Card.Title className="text-xl font-semibold">
            {localization.selectAccount}
          </Card.Title>
          <Card.Description>
            {interpolateClient(
              localization.selectAccountDescription,
              clientName
            )}
          </Card.Description>
        </div>
      </Card.Header>

      <Card.Content className="px-4 pb-6 sm:px-6">
        {isDeviceSessionsPending ? (
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ) : !deviceSessions?.length ? (
          <div className="flex flex-col items-center gap-1 py-6 text-center">
            <p className="text-sm font-semibold">{localization.noAccounts}</p>
            <p className="text-xs text-muted">
              {interpolateClient(
                localization.noAccountsDescription,
                clientName
              )}
            </p>
          </div>
        ) : (
          <ListBox
            className="divide-y divide-separator rounded-lg bg-surface-secondary p-0"
            aria-label={localization.selectAccount}
            disabledKeys={
              isBusy || !client || isSessionPending
                ? deviceSessions.map((s) => s.session.id)
                : []
            }
            selectionMode="none"
            onAction={(key) => {
              const deviceSession = deviceSessions.find(
                (candidate) => candidate.session.id === key
              )

              if (deviceSession) selectAccount(deviceSession)
            }}
          >
            {deviceSessions.map((deviceSession) => (
              <ListBox.Item
                id={deviceSession.session.id}
                key={deviceSession.session.id}
                className="gap-3 rounded-none p-4"
                textValue={deviceSession.user.name || deviceSession.user.email}
              >
                <UserAvatar className="size-10" user={deviceSession.user} />

                <div className="flex min-w-0 flex-col">
                  <Label className="break-words text-base">
                    {deviceSession.user.name || deviceSession.user.email}
                  </Label>
                  {deviceSession.user.name ? (
                    <Description className="break-all text-sm">
                      {deviceSession.user.email}
                    </Description>
                  ) : null}
                </div>

                <div className="ml-auto flex shrink-0 items-center gap-2">
                  {deviceSession.session.id === session?.session.id && (
                    <Chip size="sm" variant="secondary">
                      {localization.currentAccount}
                    </Chip>
                  )}

                  {pendingSessionId === deviceSession.session.id && (
                    <Spinner color="current" size="sm" />
                  )}
                </div>
              </ListBox.Item>
            ))}
          </ListBox>
        )}
      </Card.Content>
    </Card>
  )
}
