import {
  type OAuthAuthorizationRequest,
  parseOAuthAuthorizationRequest,
  sanitizeOAuthClientUrl
} from "@better-auth-ui/core/plugins"
import {
  type ListDeviceSession,
  listDeviceSessionsOptions,
  type OAuthProviderMultiSessionAuthClient,
  oauthContinueOptions,
  setActiveSessionOptions,
  useAuth,
  useAuthPlugin,
  usePublicOAuthClient,
  useSession
} from "@better-auth-ui/solid"
import { createMutation, createQuery } from "@tanstack/solid-query"
import { ShieldCheck } from "lucide-solid"
import { createSignal, For, onMount, Show } from "solid-js"

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
  class?: string
}

type OAuthDeviceSession = ListDeviceSession<OAuthProviderMultiSessionAuthClient>

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
export function OAuthSelectAccount(props: OAuthSelectAccountProps) {
  const auth = useAuth()
  const { localization } = useAuthPlugin(oauthProviderPlugin)
  const oauthClient = auth.authClient as OAuthProviderMultiSessionAuthClient

  const session = useSession(oauthClient)
  const [request, setRequest] = createSignal<OAuthAuthorizationRequest>()
  const [pendingSessionId, setPendingSessionId] = createSignal<string>()

  onMount(() => {
    setRequest(parseOAuthAuthorizationRequest(window.location.search))
  })

  const publicClient = usePublicOAuthClient(
    oauthClient,
    () => request()?.clientId
  )
  const deviceSessions = createQuery(() => ({
    ...listDeviceSessionsOptions(oauthClient, session.data?.user.id),
    enabled: Boolean(session.data?.user.id)
  }))

  const clientName = () =>
    publicClient.data?.client_name || localization.application
  const logoUrl = () => sanitizeOAuthClientUrl(publicClient.data?.logo_uri)

  const setActiveSession = createMutation(() =>
    setActiveSessionOptions(oauthClient)
  )
  const oauthContinue = createMutation(() => oauthContinueOptions(oauthClient))

  const invalidRequest = () =>
    request() !== undefined &&
    (!request()?.clientId ||
      (!session.isPending && !session.data) ||
      publicClient.isError ||
      (!publicClient.isPending && session.data && !publicClient.data))

  const accounts = () => (deviceSessions.data ?? []) as OAuthDeviceSession[]
  const isBusy = () => pendingSessionId() !== undefined

  const selectAccount = async (deviceSession: OAuthDeviceSession) => {
    setPendingSessionId(deviceSession.session.id)

    try {
      if (deviceSession.session.id !== session.data?.session.id) {
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

  return (
    <Show
      when={!invalidRequest()}
      fallback={
        <Card class={cn("w-full max-w-md", props.class)}>
          <CardHeader>
            <CardTitle class="text-xl">{localization.invalidRequest}</CardTitle>
            <CardDescription>
              {localization.invalidRequestDescription}
            </CardDescription>
          </CardHeader>
        </Card>
      }
    >
      <Card class={cn("w-full max-w-md", props.class)}>
        <CardHeader class="gap-4">
          <div class="flex items-center gap-3">
            <Show
              when={publicClient.data}
              fallback={<Skeleton class="size-10 rounded-full" />}
            >
              <Avatar size="lg">
                <AvatarImage
                  alt={clientName()}
                  referrerpolicy="no-referrer"
                  src={logoUrl()}
                />
                <AvatarFallback>
                  <ShieldCheck class="size-5" />
                </AvatarFallback>
              </Avatar>
            </Show>

            <div class="min-w-0 flex-1">
              <Show
                when={publicClient.data}
                fallback={<Skeleton class="h-4 w-36" />}
              >
                {(client) => (
                  <>
                    <p class="truncate font-medium">{clientName()}</p>
                    <Show when={client().client_uri}>
                      {(uri) => (
                        <p class="truncate text-muted-foreground text-xs">
                          {uri()}
                        </p>
                      )}
                    </Show>
                  </>
                )}
              </Show>
            </div>
          </div>

          <div class="grid gap-1">
            <CardTitle class="text-xl">{localization.selectAccount}</CardTitle>
            <CardDescription>
              {interpolateClient(
                localization.selectAccountDescription,
                clientName()
              )}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Show
            when={!deviceSessions.isPending}
            fallback={
              <ItemGroup>
                <Item variant="outline">
                  <ItemMedia>
                    <UserAvatar isPending />
                  </ItemMedia>
                  <ItemContent>
                    <Skeleton class="h-4 w-28" />
                    <Skeleton class="h-3 w-40" />
                  </ItemContent>
                </Item>
              </ItemGroup>
            }
          >
            <Show
              when={accounts().length > 0}
              fallback={
                <div class="flex flex-col items-center gap-1 py-6 text-center">
                  <p class="font-semibold text-sm">{localization.noAccounts}</p>
                  <p class="text-muted-foreground text-xs">
                    {interpolateClient(
                      localization.noAccountsDescription,
                      clientName()
                    )}
                  </p>
                </div>
              }
            >
              <ItemGroup class="gap-2">
                <For each={accounts()}>
                  {(deviceSession) => (
                    <Item variant="outline">
                      <ItemMedia>
                        <UserAvatar user={deviceSession.user} />
                      </ItemMedia>

                      <ItemContent>
                        <ItemTitle class="truncate">
                          {deviceSession.user.name || deviceSession.user.email}
                        </ItemTitle>
                        <Show when={deviceSession.user.name}>
                          <ItemDescription class="truncate">
                            {deviceSession.user.email}
                          </ItemDescription>
                        </Show>
                      </ItemContent>

                      <ItemActions>
                        <Show
                          when={
                            deviceSession.session.id ===
                            session.data?.session.id
                          }
                        >
                          <Badge variant="secondary">
                            {localization.currentAccount}
                          </Badge>
                        </Show>

                        <Button
                          disabled={isBusy()}
                          size="sm"
                          onClick={() => selectAccount(deviceSession)}
                        >
                          <Show
                            when={
                              pendingSessionId() === deviceSession.session.id
                            }
                          >
                            <Spinner />
                          </Show>
                          {localization.continue}
                        </Button>
                      </ItemActions>
                    </Item>
                  )}
                </For>
              </ItemGroup>
            </Show>
          </Show>
        </CardContent>
      </Card>
    </Show>
  )
}
