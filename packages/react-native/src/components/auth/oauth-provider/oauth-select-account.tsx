import {
  parseOAuthAuthorizationRequest,
  type OAuthProviderMultiSessionAuthClient
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

export function OAuthSelectAccount({
  oauthQuery,
  ...props
}: AuthViewProps & { oauthQuery?: string }) {
  const { authClient, basePaths, viewPaths, localization: common } = useAuth()
  const { localization } = useAuthPlugin(oauthProviderPlugin)
  const client = authClient as OAuthProviderMultiSessionAuthClient
  const session = useSession(client)
  const sessions = useListDeviceSessions(client)
  const setActive = useSetActiveSession(client)
  const resume = useOAuthContinue(client)
  const navigation = useAuthNavigation()
  const query = getNativeOAuthQuery(navigation, oauthQuery)
  const request = parseOAuthAuthorizationRequest(query)
  const publicClient = usePublicOAuthClient(client, request.clientId, {
    oauthQuery: query,
    enabled: !!request.clientId,
    retry: false,
    staleTime: 0,
    gcTime: 0
  })
  const [selected, setSelected] = useState<string>()
  const [error, setError] = useState("")
  const allowed =
    !!request.clientId &&
    !!publicClient.data &&
    !publicClient.isFetching &&
    !publicClient.error
  return (
    <Card className={props.className} variant={props.variant}>
      <Card.Header>
        <Card.Title>{localization.selectAccount}</Card.Title>
        <Description>
          {localization.selectAccountDescription.replace(
            "{{client}}",
            publicClient.data?.client_name ?? localization.application
          )}
        </Description>
      </Card.Header>
      <Card.Content className="gap-3">
        {sessions.isPending || publicClient.isFetching ? (
          <Skeleton className="h-20 w-full" />
        ) : null}
        {!request.clientId || publicClient.error ? (
          <Description>{localization.invalidRequestDescription}</Description>
        ) : null}
        {sessions.error || error ? (
          <Txt accessibilityRole="alert">
            {error || sessions.error?.message}
          </Txt>
        ) : null}
        {sessions.data?.length === 0 ? (
          <Description>
            {localization.noAccountsDescription.replace(
              "{{client}}",
              publicClient.data?.client_name ?? localization.application
            )}
          </Description>
        ) : null}
        {allowed ? (
          <Button
            isDisabled={!!selected}
            onPress={() =>
              navigation.push("signIn", {
                params: {
                  redirectTo: `${navigation.getPath?.({ section: "auth", view: "oauthSelectAccount" }) ?? `${basePaths.auth}/${viewPaths.auth.oauthSelectAccount}`}?${new URLSearchParams({ oauth_query: query })}`
                }
              })
            }
          >
            {common.auth.signIn}
          </Button>
        ) : null}
        {sessions.data?.map((item) => (
          <Button
            key={item.session.id}
            isDisabled={!allowed || !!selected}
            isPending={selected === item.session.id}
            onPress={() => {
              setSelected(item.session.id)
              setError("")
              void (async () => {
                try {
                  if (item.session.id !== session.data?.session.id)
                    await setActive.mutateAsync({
                      sessionToken: item.session.token
                    })
                  const result = await resume.mutateAsync({
                    selected: true,
                    oauth_query: query
                  })
                  await followOAuthRedirect(result, query)
                } catch (error) {
                  setError((error as Error).message)
                  setSelected(undefined)
                }
              })()
            }}
          >
            {item.user.name || item.user.email}
            {item.session.id === session.data?.session.id
              ? ` (${localization.currentAccount})`
              : ""}
          </Button>
        ))}
      </Card.Content>
    </Card>
  )
}
