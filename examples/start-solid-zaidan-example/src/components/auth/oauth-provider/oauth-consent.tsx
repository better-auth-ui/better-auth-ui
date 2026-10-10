import {
  getOAuthAuthorizationDestination,
  type OAuthProviderAuthClient,
  parseOAuthAuthorizationRequest,
  resolveOAuthScopeMetadata,
  sanitizeOAuthClientUrl
} from "@better-auth-ui/core/plugins/oauth-provider"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/solid"
import {
  useOAuthConsent,
  usePublicOAuthClient
} from "@better-auth-ui/solid/plugins/oauth-provider"
import { AppWindow, Check, Ellipsis, Link as LinkIcon } from "lucide-solid"
import {
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show
} from "solid-js"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { oauthProviderPlugin } from "@/lib/auth/oauth-provider-plugin"
import { cn } from "cn"
import { UserAvatar } from "../user/user-avatar"

export type OAuthConsentProps = {
  class?: string
  /** The complete signed query. Pass it from your router for same-page navigation. */
  oauthQuery?: string
}

const interpolateClient = (template: string, clientName: string) =>
  template.replace("{{client}}", clientName)

export function OAuthConsent(props: OAuthConsentProps) {
  const auth = useAuth()
  const { localization, scopeMetadata } = useAuthPlugin(oauthProviderPlugin)
  const oauthClient = auth.authClient as OAuthProviderAuthClient
  const session = useSession(oauthClient)
  const [browserQuery, setBrowserQuery] = createSignal<string>()
  onMount(() => {
    const updateQuery = () => setBrowserQuery(window.location.search)
    updateQuery()
    window.addEventListener("popstate", updateQuery)
    onCleanup(() => window.removeEventListener("popstate", updateQuery))
  })
  const query = () => props.oauthQuery ?? browserQuery()
  const request = createMemo(() => {
    const search = query()
    return search === undefined
      ? undefined
      : parseOAuthAuthorizationRequest(search)
  })
  const publicClient = usePublicOAuthClient(
    oauthClient,
    () => request()?.clientId,
    () => ({
      enabled: Boolean(session.data && request()?.clientId),
      oauthQuery: query(),
      retry: false,
      staleTime: 0,
      gcTime: 0
    })
  )
  const client = () =>
    !publicClient.isFetching && !publicClient.isError
      ? publicClient.data
      : undefined
  const destination = () => {
    const search = query()
    return client() && search
      ? getOAuthAuthorizationDestination(search)
      : undefined
  }
  const consent = useOAuthConsent(oauthClient)
  const clientName = () => client()?.client_name || localization.application
  const logoUrl = () => sanitizeOAuthClientUrl(client()?.logo_uri)
  const policyUrl = () => sanitizeOAuthClientUrl(client()?.policy_uri)
  const termsUrl = () => sanitizeOAuthClientUrl(client()?.tos_uri)
  const invalidRequest = () =>
    request() !== undefined &&
    (!request()?.clientId ||
      (!session.isPending && !session.data) ||
      publicClient.isError ||
      (!publicClient.isPending && session.data && !publicClient.data))
  const canRespond = () =>
    Boolean(
      request()?.clientId && session.data && client() && !consent.isPending
    )

  return (
    <Show
      when={!invalidRequest()}
      fallback={
        <Card class={cn("w-full max-w-md", props.class)}>
          <CardHeader>
            <CardTitle role="heading" aria-level={2} class="text-xl!">
              {localization.invalidRequest}
            </CardTitle>
            <CardDescription>
              {localization.invalidRequestDescription}
            </CardDescription>
          </CardHeader>
        </Card>
      }
    >
      <Card class={cn("w-full max-w-md", props.class)}>
        <CardHeader class="gap-4!">
          <div class="flex items-center justify-center gap-5">
            <Show
              when={client()}
              fallback={<Skeleton class="size-16 rounded-full" />}
            >
              <Avatar class="size-16!">
                <AvatarImage
                  alt={clientName()}
                  referrerpolicy="no-referrer"
                  src={logoUrl()}
                />
                <AvatarFallback>
                  <AppWindow class="size-7" />
                </AvatarFallback>
              </Avatar>
            </Show>
            <Ellipsis aria-hidden="true" class="size-5 text-muted-foreground" />
            <Show
              when={session.data}
              fallback={<Skeleton class="size-16 rounded-full" />}
            >
              {(currentSession) => (
                <UserAvatar class="size-16!" user={currentSession().user} />
              )}
            </Show>
          </div>
          <div class="grid justify-items-center gap-1 text-center">
            <CardTitle
              role="heading"
              aria-level={2}
              class="max-w-full break-words text-xl! font-semibold!"
            >
              <Show when={client()} fallback={<Skeleton class="h-6 w-36" />}>
                {clientName()}
              </Show>
            </CardTitle>
            <CardDescription>
              {localization.authorizationRequest}
            </CardDescription>
            <div class="mt-2 flex max-w-full flex-wrap justify-center gap-x-1 text-sm text-muted-foreground">
              <span>{localization.signedInAs}</span>
              <Show
                when={session.data}
                fallback={<Skeleton class="h-4 w-32" />}
              >
                {(currentSession) => (
                  <span class="break-all font-medium">
                    {currentSession().user.name || currentSession().user.email}
                  </span>
                )}
              </Show>
            </div>
          </div>
        </CardHeader>

        <CardContent class="flex flex-col gap-5">
          <div class="grid gap-3">
            <p class="text-sm font-medium">
              {interpolateClient(
                localization.requestedPermissions,
                clientName()
              )}
            </p>

            <Show
              when={client() && request()}
              fallback={
                <div class="flex gap-3">
                  <Skeleton class="mt-0.5 size-4 shrink-0 rounded-full" />
                  <div class="grid flex-1 gap-2">
                    <Skeleton class="h-4 w-32" />
                    <Skeleton class="h-3 w-full max-w-64" />
                  </div>
                </div>
              }
            >
              {(authorizationRequest) => (
                <ul class="grid gap-3">
                  <For each={authorizationRequest().scopes}>
                    {(scope) => {
                      const metadata = () =>
                        resolveOAuthScopeMetadata(scopeMetadata, scope, {
                          clientId: authorizationRequest().clientId,
                          requestedScopes: authorizationRequest().scopes
                        })

                      return (
                        <li class="flex gap-3">
                          <Check class="mt-0.5 size-4 shrink-0 text-primary" />
                          <div class="grid gap-0.5">
                            <p class="text-sm font-medium">
                              {metadata().label}
                            </p>
                            <Show when={metadata().description}>
                              {(description) => (
                                <p class="text-muted-foreground text-xs">
                                  {description()}
                                </p>
                              )}
                            </Show>
                          </div>
                        </li>
                      )
                    }}
                  </For>
                </ul>
              )}
            </Show>
          </div>

          <Separator />

          <Show when={destination()}>
            {(uri) => (
              <div class="flex gap-2 text-xs text-muted-foreground">
                <LinkIcon aria-hidden="true" class="mt-0.5 size-4 shrink-0" />
                <p>
                  {localization.redirectTo}{" "}
                  <span class="block break-all font-medium text-foreground">
                    {uri()}
                  </span>
                </p>
              </div>
            )}
          </Show>
          <p class="text-xs text-muted-foreground">
            {localization.applicationInformation}
          </p>

          <Show when={policyUrl() || termsUrl()}>
            <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs">
              <Show when={policyUrl()}>
                {(uri) => (
                  <a
                    class="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    href={uri()}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {localization.privacyPolicy}
                  </a>
                )}
              </Show>
              <Show when={termsUrl()}>
                {(uri) => (
                  <a
                    class="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    href={uri()}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {localization.termsOfService}
                  </a>
                )}
              </Show>
            </div>
          </Show>
        </CardContent>

        <CardFooter class="grid grid-cols-2 gap-2">
          <Button
            disabled={!canRespond()}
            variant="outline"
            onClick={() =>
              consent.mutate({ accept: false, oauth_query: query() })
            }
          >
            <Show
              when={consent.isPending && consent.variables?.accept === false}
            >
              <Spinner />
            </Show>
            {localization.cancel}
          </Button>
          <Button
            disabled={!canRespond()}
            onClick={() =>
              consent.mutate({ accept: true, oauth_query: query() })
            }
          >
            <Show
              when={consent.isPending && consent.variables?.accept === true}
            >
              <Spinner />
            </Show>
            {localization.allow}
          </Button>
        </CardFooter>
      </Card>
    </Show>
  )
}
