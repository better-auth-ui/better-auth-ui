import {
  hasOAuthPrompt,
  parseOAuthAuthorizationRequest,
  type OAuthProviderAuthClient
} from "@better-auth-ui/core/plugins/oauth-provider"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useOAuthContinue,
  usePublicOAuthClient
} from "@better-auth-ui/react/plugins/oauth-provider"
import { useState } from "react"
import { oauthProviderPlugin } from "../../../lib/auth/oauth-provider-plugin"
import type { AuthViewProps } from "../../../lib/auth-plugin"
import {
  getNativeOAuthQuery,
  followOAuthRedirect
} from "../../../lib/native-oauth"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { Skeleton } from "../../../primitives/skeleton"
import { Txt } from "../../../primitives/styled"
import { SignUp } from "../sign-up"

export function OAuthSignUp({
  oauthQuery,
  ...props
}: AuthViewProps & { oauthQuery?: string }) {
  const { authClient, basePaths, viewPaths, localization: common } = useAuth()
  const { localization } = useAuthPlugin(oauthProviderPlugin)
  const client = authClient as OAuthProviderAuthClient
  const navigation = useAuthNavigation()
  const session = useSession(authClient)
  const query = getNativeOAuthQuery(navigation, oauthQuery)
  const returnPath = `${navigation.getPath?.({ section: "auth", view: "oauthSignUp" }) ?? `${basePaths.auth}/${viewPaths.auth.oauthSignUp}`}?${new URLSearchParams({ oauth_query: query, created: "true" })}`
  const request = parseOAuthAuthorizationRequest(query)
  const oauth = hasOAuthPrompt(request, "create")
  const metadata = usePublicOAuthClient(client, request.clientId, {
    oauthQuery: query,
    enabled: oauth && !!request.clientId,
    retry: false,
    staleTime: 0,
    gcTime: 0
  })
  const resume = useOAuthContinue(client)
  const [created, setCreated] = useState(
    oauth && navigation.getParam("created") === "true"
  )
  const [error, setError] = useState("")
  const complete = async () => {
    setCreated(true)
    if (
      !session.data ||
      !metadata.data ||
      metadata.isFetching ||
      metadata.error
    )
      return
    setError("")
    try {
      const result = await resume.mutateAsync({
        created: true,
        oauth_query: query
      })
      await followOAuthRedirect(result, query)
    } catch (error) {
      setError((error as Error).message)
    }
  }
  if (oauth && (!request.clientId || metadata.error))
    return <Description>{localization.invalidRequestDescription}</Description>
  if (created)
    return (
      <Card variant={props.variant}>
        <Card.Header>
          <Card.Title>{localization.accountCreated}</Card.Title>
        </Card.Header>
        <Card.Content>
          <Description>
            {(error
              ? localization.continueFailed
              : localization.continuing
            ).replace(
              "{{client}}",
              metadata.data?.client_name ?? localization.application
            )}
          </Description>
          {error ? (
            <>
              <Txt accessibilityRole="alert">{error}</Txt>
              <Button
                isPending={resume.isPending}
                onPress={() => {
                  void complete()
                }}
              >
                {localization.tryAgain}
              </Button>
            </>
          ) : null}
          {!error ? (
            <Button
              isDisabled={
                resume.isPending ||
                metadata.isPending ||
                metadata.isFetching ||
                !!metadata.error
              }
              isPending={resume.isPending}
              onPress={() =>
                session.data
                  ? void complete()
                  : navigation.push("signIn", {
                      params: { redirectTo: returnPath }
                    })
              }
            >
              {session.data ? common.auth.callbackContinue : common.auth.signIn}
            </Button>
          ) : null}
        </Card.Content>
      </Card>
    )
  if (oauth && (metadata.isPending || metadata.isFetching))
    return (
      <Card variant={props.variant}>
        <Card.Header>
          <Card.Title>{common.auth.signUp}</Card.Title>
        </Card.Header>
        <Card.Content>
          <Skeleton className="h-20 w-full" />
        </Card.Content>
      </Card>
    )
  return (
    <SignUp
      {...props}
      verificationRedirectTo={oauth ? returnPath : undefined}
      onSignUpSuccess={
        oauth
          ? () => {
              void complete()
            }
          : undefined
      }
    />
  )
}
