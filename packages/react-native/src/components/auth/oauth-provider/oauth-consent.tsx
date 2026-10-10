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
import { oauthProviderPlugin } from "../../../lib/auth/oauth-provider-plugin"
import { useNativeAuthenticate } from "../../../lib/auth/use-native-authenticate"
import type { AuthViewProps } from "../../../lib/auth-plugin"
import {
  getNativeOAuthQuery,
  followOAuthRedirect
} from "../../../lib/native-oauth"
import { openExternalURL } from "../../../lib/open-external-url"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"

export function OAuthConsent({
  oauthQuery,
  ...props
}: AuthViewProps & { oauthQuery?: string }) {
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
  const decide = async (accept: boolean) => {
    setError("")
    try {
      const result = await consent.mutateAsync({ accept, oauth_query: query })
      await followOAuthRedirect(result, query)
    } catch (error) {
      setError((error as Error).message)
    }
  }
  return (
    <Card className={props.className} variant={props.variant}>
      <Card.Header>
        <Card.Title>
          {localization.authorize.replace("{{client}}", clientName)}
        </Card.Title>
        <Description>
          {localization.authorizationDescription.replace(
            "{{client}}",
            clientName
          )}
        </Description>
      </Card.Header>
      <Card.Content className="gap-4">
        {!request.clientId || publicClient.error ? (
          <Description>{localization.invalidRequestDescription}</Description>
        ) : null}
        {publicClient.isFetching || session.isPending ? (
          <Skeleton className="h-20 w-full" />
        ) : null}
        {valid ? (
          <>
            <Description>
              {localization.signedInAs}:{" "}
              {session.data?.user.name || session.data?.user.email}
            </Description>
            <Description>{localization.applicationInformation}</Description>
            {request.scopes.map((scope) => {
              const details = resolveOAuthScopeMetadata(scopeMetadata, scope, {
                clientId: request.clientId,
                requestedScopes: request.scopes
              })
              return (
                <Box key={scope} className="gap-1">
                  <Txt className="font-medium">{details.label}</Txt>
                  {details.description ? (
                    <Description>{details.description}</Description>
                  ) : null}
                </Box>
              )
            })}
            <Description>
              {localization.redirectTo}:{" "}
              {getOAuthAuthorizationDestination(query)}
            </Description>
            {(
              [
                [client.policy_uri, localization.privacyPolicy],
                [client.tos_uri, localization.termsOfService]
              ] as const
            ).map(([url, label]) =>
              sanitizeOAuthClientUrl(url) ? (
                <Button
                  key={label}
                  onPress={() => {
                    void openExternalURL(url!).catch((error) =>
                      setError(error.message)
                    )
                  }}
                >
                  {label}
                </Button>
              ) : null
            )}
          </>
        ) : null}
        {error ? <Txt accessibilityRole="alert">{error}</Txt> : null}
      </Card.Content>
      <Card.Footer className="flex-row gap-2">
        <Button
          isDisabled={!valid || consent.isPending}
          onPress={() => {
            void decide(false)
          }}
        >
          {localization.cancel}
        </Button>
        <Button
          isDisabled={!valid}
          isPending={consent.isPending}
          onPress={() => {
            void decide(true)
          }}
        >
          {localization.allow}
        </Button>
      </Card.Footer>
    </Card>
  )
}
