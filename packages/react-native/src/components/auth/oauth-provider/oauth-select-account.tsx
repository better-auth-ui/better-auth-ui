import {
  parseOAuthAuthorizationRequest,
  sanitizeOAuthClientUrl,
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
import { useWindowDimensions } from "react-native"
import { oauthProviderPlugin } from "../../../lib/auth/oauth-provider-plugin"
import type { AuthViewProps } from "../../../lib/auth-plugin"
import {
  getNativeOAuthQuery,
  followOAuthRedirect
} from "../../../lib/native-oauth"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { cn } from "../../../lib/cn"
import { Avatar } from "../../../primitives/avatar"
import { Separator } from "../../../primitives/separator"
import { ChevronRight, Display } from "../../../primitives/ui-icons"
import { UserAvatar } from "../user/user-avatar"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, ScrollBox, Txt } from "../../../primitives/styled"

export function OAuthSelectAccount({
  oauthQuery,
  ...props
}: AuthViewProps & { oauthQuery?: string }) {
  const { height } = useWindowDimensions()
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
  const clientName = publicClient.data?.client_name ?? localization.application
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
            <Box className="items-center gap-3">
              {publicClient.data ? (
                <Avatar className="size-16">
                  <Avatar.Image
                    src={sanitizeOAuthClientUrl(publicClient.data.logo_uri)}
                    alt={clientName}
                  />
                  <Avatar.Fallback>
                    <Display className="size-7" />
                  </Avatar.Fallback>
                </Avatar>
              ) : (
                <Skeleton className="size-16 rounded-full" />
              )}
              {publicClient.data ? (
                <Txt className="text-base font-medium text-foreground">
                  {clientName}
                </Txt>
              ) : (
                <Skeleton className="h-5 w-36" />
              )}
            </Box>
            <Box className="items-center gap-1">
              <Card.Title>{localization.selectAccount}</Card.Title>
              <Description className="text-center">
                {localization.selectAccountDescription.replace(
                  "{{client}}",
                  clientName
                )}
              </Description>
            </Box>
          </Card.Header>
          <Card.Content className="gap-3">
            {!request.clientId || publicClient.error ? (
              <Description>
                {localization.invalidRequestDescription}
              </Description>
            ) : null}
            {sessions.error || error ? (
              <Txt accessibilityRole="alert">
                {error || sessions.error?.message}
              </Txt>
            ) : null}
            {sessions.isPending ? (
              <Box className="flex-row items-center gap-3 rounded-lg bg-surface-secondary p-4">
                <UserAvatar isPending />
                <Box className="flex-1 gap-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-40" />
                </Box>
              </Box>
            ) : sessions.data?.length === 0 ? (
              <Description>
                {localization.noAccountsDescription.replace(
                  "{{client}}",
                  clientName
                )}
              </Description>
            ) : (
              <Box className="overflow-hidden rounded-lg bg-surface-secondary">
                {sessions.data?.map((item) => (
                  <Box key={item.session.id}>
                    <Button
                      className="h-auto min-h-20 justify-start gap-3 rounded-none p-4"
                      variant="ghost"
                      aria-label={`${localization.continue}: ${item.user.name || item.user.email} (${item.user.email})`}
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
                      <UserAvatar className="size-10" user={item.user} />
                      <Box className="min-w-0 flex-1 gap-1">
                        <Txt className="text-base font-medium text-foreground">
                          {item.user.name || item.user.email}
                        </Txt>
                        {item.user.name ? (
                          <Description>{item.user.email}</Description>
                        ) : null}
                      </Box>
                      {item.session.id === session.data?.session.id ? (
                        <Description>{localization.currentAccount}</Description>
                      ) : null}
                      <ChevronRight
                        aria-hidden={true}
                        className="size-4 text-muted"
                      />
                    </Button>
                    <Separator />
                  </Box>
                ))}
              </Box>
            )}
          </Card.Content>
        </ScrollBox>
        {allowed ? (
          <>
            <Separator />
            <Card.Footer className="p-4">
              <Button
                variant="secondary"
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
            </Card.Footer>
          </>
        ) : null}
      </Card>
    </Box>
  )
}
