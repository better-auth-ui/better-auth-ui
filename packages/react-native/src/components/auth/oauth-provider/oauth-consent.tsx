import {
  getOAuthAuthorizationDestination,
  parseOAuthAuthorizationRequest,
  resolveOAuthScopeMetadata,
  sanitizeOAuthClientUrl,
  type OAuthProviderAuthClient
} from "@better-auth-ui/core/plugins/oauth-provider"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useOAuthConsent,
  usePublicOAuthClient
} from "@better-auth-ui/react/plugins/oauth-provider"
import { useState } from "react"
import { useWindowDimensions } from "react-native"
import { oauthProviderPlugin } from "../../../lib/auth/oauth-provider-plugin"
import { useNativeAuthenticate } from "../../../lib/auth/use-native-authenticate"
import type { AuthViewProps } from "../../../lib/auth-plugin"
import {
  getNativeOAuthQuery,
  followOAuthRedirect
} from "../../../lib/native-oauth"
import { openExternalURL } from "../../../lib/open-external-url"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Avatar } from "../../../primitives/avatar"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { Separator } from "../../../primitives/separator"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, ScrollBox, Txt } from "../../../primitives/styled"
import { Check, Display, LinkIcon, Shield } from "../../../primitives/ui-icons"
import { UserAvatar } from "../user/user-avatar"
import { cn } from "../../../lib/cn"

export function OAuthConsent({
  oauthQuery,
  ...props
}: AuthViewProps & { oauthQuery?: string }) {
  const { height } = useWindowDimensions()
  const { authClient } = useAuth()
  const { localization, scopeMetadata } = useAuthPlugin(oauthProviderPlugin)
  const session = useNativeAuthenticate({
    section: "auth",
    view: "oauthConsent"
  })
  const query = getNativeOAuthQuery(useAuthNavigation(), oauthQuery)
  const request = parseOAuthAuthorizationRequest(query)
  const publicClient = usePublicOAuthClient(
    authClient as OAuthProviderAuthClient,
    request.clientId,
    {
      oauthQuery: query,
      enabled: !!session.data && !!request.clientId,
      retry: false,
      staleTime: 0,
      gcTime: 0
    }
  )
  const consent = useOAuthConsent(authClient as OAuthProviderAuthClient)
  const [error, setError] = useState("")
  const client =
    !publicClient.isFetching && !publicClient.error
      ? publicClient.data
      : undefined
  const clientName = client?.client_name ?? localization.application
  const valid = !!client && !!session.data && !!request.clientId
  const invalidRequest = !request.clientId || !!publicClient.error
  const logoUrl = sanitizeOAuthClientUrl(client?.logo_uri)
  const destination = valid
    ? getOAuthAuthorizationDestination(query)
    : undefined
  const policyUrl = sanitizeOAuthClientUrl(client?.policy_uri)
  const termsUrl = sanitizeOAuthClientUrl(client?.tos_uri)
  const decide = async (accept: boolean) => {
    setError("")
    try {
      const result = await consent.mutateAsync({ accept, oauth_query: query })
      await followOAuthRedirect(result, query)
    } catch (error) {
      setError((error as Error).message)
    }
  }
  if (invalidRequest) {
    return (
      <Card className={props.className} variant={props.variant}>
        <Card.Header className="gap-2">
          <Card.Title>{localization.invalidRequest}</Card.Title>
          <Description>{localization.invalidRequestDescription}</Description>
        </Card.Header>
      </Card>
    )
  }

  return (
    <Box style={{ maxHeight: Math.max(0, height - 32) }}>
      <Card
        className={cn("min-h-0 shrink overflow-hidden p-0", props.className)}
        variant={props.variant}
      >
        <ScrollBox
          className="min-h-0 shrink"
          contentContainerClassName="gap-6 p-6"
        >
          <Card.Header className="items-center gap-5">
            <Box className="flex-row items-center justify-center gap-5">
              {client ? (
                <Avatar className="size-16">
                  <Avatar.Image src={logoUrl} alt={clientName} />
                  <Avatar.Fallback>
                    <Display className="size-7 text-muted" />
                  </Avatar.Fallback>
                </Avatar>
              ) : (
                <Skeleton className="size-16 rounded-full" />
              )}
              <Txt aria-hidden={true} className="text-muted">
                ···
              </Txt>
              <UserAvatar
                className="size-16"
                user={session.data?.user}
                isPending={session.isPending}
              />
            </Box>
            <Box className="items-center gap-1">
              {client ? (
                <Card.Title className="text-center">{clientName}</Card.Title>
              ) : (
                <Skeleton className="h-6 w-36" />
              )}
              <Description className="text-center">
                {localization.authorizationRequest}
              </Description>
              <Box className="mt-2 flex-row flex-wrap justify-center gap-1">
                <Description>{localization.signedInAs}</Description>
                {session.data ? (
                  <Txt className="text-sm font-medium text-foreground">
                    {session.data.user.name || session.data.user.email}
                  </Txt>
                ) : (
                  <Skeleton className="h-4 w-32" />
                )}
              </Box>
            </Box>
          </Card.Header>
          <Card.Content className="gap-5 rounded-lg bg-surface-secondary p-5">
            <Txt className="text-sm font-medium text-foreground">
              {localization.requestedPermissions.replace(
                "{{client}}",
                clientName
              )}
            </Txt>
            {valid ? (
              request.scopes.map((scope) => {
                const details = resolveOAuthScopeMetadata(
                  scopeMetadata,
                  scope,
                  {
                    clientId: request.clientId,
                    requestedScopes: request.scopes
                  }
                )
                return (
                  <Box key={scope} className="flex-row gap-3">
                    <Check
                      aria-hidden={true}
                      className="mt-1 size-5 text-muted"
                    />
                    <Box className="min-w-0 flex-1 gap-1">
                      <Txt className="text-base text-foreground">
                        {details.label}
                      </Txt>
                      {details.description ? (
                        <Description>{details.description}</Description>
                      ) : null}
                    </Box>
                  </Box>
                )
              })
            ) : (
              <Box className="flex-row gap-3">
                <Skeleton className="size-5 rounded-full" />
                <Box className="flex-1 gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </Box>
              </Box>
            )}
            <Separator />
            {destination ? (
              <Box className="flex-row gap-3">
                <LinkIcon
                  aria-hidden={true}
                  className="mt-1 size-4 text-muted"
                />
                <Box className="min-w-0 flex-1">
                  <Description>{localization.redirectTo}</Description>
                  <Txt className="text-sm font-medium text-foreground">
                    {destination}
                  </Txt>
                </Box>
              </Box>
            ) : null}
            {policyUrl || termsUrl ? (
              <Box className="flex-row flex-wrap gap-3">
                {(
                  [
                    ["policy", policyUrl, localization.privacyPolicy],
                    ["terms", termsUrl, localization.termsOfService]
                  ] as const
                ).map(([kind, url, label]) =>
                  url ? (
                    <Button
                      key={kind}
                      size="sm"
                      variant="ghost"
                      onPress={() => {
                        void openExternalURL(url).catch((error) =>
                          setError(error.message)
                        )
                      }}
                    >
                      {label}
                    </Button>
                  ) : null
                )}
              </Box>
            ) : null}
            <Box className="flex-row gap-3">
              <Shield aria-hidden={true} className="mt-1 size-4 text-muted" />
              <Description className="flex-1">
                {localization.applicationInformation}
              </Description>
            </Box>
            {error ? (
              <Txt accessibilityRole="alert" className="text-danger">
                {error}
              </Txt>
            ) : null}
          </Card.Content>
        </ScrollBox>
        <Separator />
        <Card.Footer className="flex-row gap-3 p-4">
          <Button
            className="flex-1"
            variant="secondary"
            isPending={consent.isPending && consent.variables?.accept === false}
            isDisabled={!valid || consent.isPending}
            onPress={() => {
              void decide(false)
            }}
          >
            {localization.cancel}
          </Button>
          <Button
            className="flex-1"
            variant="primary"
            isDisabled={!valid || consent.isPending}
            isPending={consent.isPending && consent.variables?.accept === true}
            onPress={() => {
              void decide(true)
            }}
          >
            {localization.allow}
          </Button>
        </Card.Footer>
      </Card>
    </Box>
  )
}
