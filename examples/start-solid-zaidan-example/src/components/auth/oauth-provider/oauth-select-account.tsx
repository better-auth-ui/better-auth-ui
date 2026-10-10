import {
  type ListDeviceSession,
  listDeviceSessionsOptions,
  setActiveSessionOptions
} from "@better-auth-ui/core/plugins/multi-session"
import {
  type OAuthAuthorizationRequest,
  type OAuthProviderMultiSessionAuthClient,
  oauthContinueOptions,
  parseOAuthAuthorizationRequest,
  sanitizeOAuthClientUrl
} from "@better-auth-ui/core/plugins/oauth-provider"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/solid"
import { usePublicOAuthClient } from "@better-auth-ui/solid/plugins/oauth-provider"
import { createMutation, createQuery } from "@tanstack/solid-query"
import { ShieldCheck, ChevronRight } from "lucide-solid"
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

import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { oauthProviderPlugin } from "@/lib/auth/oauth-provider-plugin"
import { cn } from "cn"
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
      <Card
        class={cn(
          "max-h-[calc(100dvh-2rem)] w-full max-w-lg gap-0! overflow-y-auto py-0!",
          props.class
        )}
      >
        <CardHeader class="grid justify-items-center gap-5! p-6! text-center">
          <div class="grid justify-items-center gap-3">
            {publicClient.data ? (
              <Avatar class="size-16!">
                <AvatarImage
                  alt={clientName()}
                  referrerpolicy="no-referrer"
                  src={logoUrl()}
                />
                <AvatarFallback>
                  <ShieldCheck class="size-7" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Skeleton class="size-16 rounded-full" />
            )}
            {publicClient.data ? (
              <p class="max-w-full break-words text-base font-medium">
                {clientName()}
              </p>
            ) : (
              <Skeleton class="h-5 w-36" />
            )}
          </div>
          <div class="grid gap-1">
            <CardTitle class="text-xl! font-semibold!">
              {localization.selectAccount}
            </CardTitle>
            <CardDescription>
              {interpolateClient(
                localization.selectAccountDescription,
                clientName()
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent class="px-4! pt-0! pb-6! sm:px-6!">
          {deviceSessions.isPending ? (
            <div class="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
              <UserAvatar isPending />
              <div class="grid flex-1 gap-2">
                <Skeleton class="h-4 w-28" />
                <Skeleton class="h-3 w-40" />
              </div>
            </div>
          ) : !accounts().length ? (
            <div class="grid justify-items-center gap-1 py-6 text-center">
              <p class="text-sm font-semibold">{localization.noAccounts}</p>
              <p class="text-sm text-muted-foreground">
                {interpolateClient(
                  localization.noAccountsDescription,
                  clientName()
                )}
              </p>
            </div>
          ) : (
            <ul class="divide-y divide-border overflow-hidden rounded-lg bg-muted/50">
              <For each={accounts()}>
                {(deviceSession) => {
                  const isCurrent = () =>
                    deviceSession.session.id === session.data?.session.id
                  const isSelecting = () =>
                    pendingSessionId() === deviceSession.session.id
                  return (
                    <li>
                      <Button
                        class="h-auto! min-h-20 w-full justify-start! gap-3 rounded-none! p-4! text-left whitespace-normal!"
                        variant="ghost"
                        disabled={
                          isBusy() || !publicClient.data || session.isPending
                        }
                        aria-label={`${localization.continue}: ${deviceSession.user.name || deviceSession.user.email} (${deviceSession.user.email})`}
                        onClick={() => selectAccount(deviceSession)}
                      >
                        <UserAvatar
                          class="size-10! shrink-0"
                          user={deviceSession.user}
                        />
                        <span class="grid min-w-0 flex-1 gap-0.5">
                          <span class="break-words text-base font-medium">
                            {deviceSession.user.name ||
                              deviceSession.user.email}
                          </span>
                          {deviceSession.user.name ? (
                            <span class="break-all text-sm text-muted-foreground">
                              {deviceSession.user.email}
                            </span>
                          ) : null}
                        </span>
                        {isCurrent() ? (
                          <Badge class="shrink-0" variant="secondary">
                            {localization.currentAccount}
                          </Badge>
                        ) : null}
                        {isSelecting() ? (
                          <Spinner />
                        ) : (
                          <ChevronRight
                            aria-hidden="true"
                            class="size-4 shrink-0 text-muted-foreground"
                          />
                        )}
                      </Button>
                    </li>
                  )
                }}
              </For>
            </ul>
          )}
        </CardContent>
      </Card>
    </Show>
  )
}
