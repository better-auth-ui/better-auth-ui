import {
  type OAuthAuthorizationRequest,
  parseOAuthAuthorizationRequest,
  sanitizeOAuthClientUrl
} from "@better-auth-ui/core/plugins"
import {
  type OAuthProviderAuthClient,
  oauthConsentOptions,
  useAuth,
  useAuthPlugin,
  usePublicOAuthClient,
  useSession
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { Check, ShieldCheck } from "lucide-solid"
import { createSignal, For, onMount, Show } from "solid-js"

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
import { cn } from "@/lib/utils"
import { UserAvatar } from "../user/user-avatar"

export type OAuthConsentProps = {
  class?: string
}

const interpolateClient = (template: string, clientName: string) =>
  template.replace("{{client}}", clientName)

export function OAuthConsent(props: OAuthConsentProps) {
  const auth = useAuth()
  const { localization, scopeMetadata } = useAuthPlugin(oauthProviderPlugin)
  const oauthClient = auth.authClient as OAuthProviderAuthClient
  const session = useSession(oauthClient)
  const [request, setRequest] = createSignal<OAuthAuthorizationRequest>()

  onMount(() => {
    setRequest(parseOAuthAuthorizationRequest(window.location.search))
  })

  const publicClient = usePublicOAuthClient(
    oauthClient,
    () => request()?.clientId
  )
  const consent = createMutation(() => oauthConsentOptions(oauthClient))
  const clientName = () =>
    publicClient.data?.client_name || localization.application
  const logoUrl = () => sanitizeOAuthClientUrl(publicClient.data?.logo_uri)
  const policyUrl = () => sanitizeOAuthClientUrl(publicClient.data?.policy_uri)
  const termsUrl = () => sanitizeOAuthClientUrl(publicClient.data?.tos_uri)
  const invalidRequest = () =>
    request() !== undefined &&
    (!request()?.clientId ||
      (!session.isPending && !session.data) ||
      publicClient.isError ||
      (!publicClient.isPending && session.data && !publicClient.data))
  const canRespond = () =>
    Boolean(
      request()?.clientId &&
        session.data &&
        publicClient.data &&
        !consent.isPending
    )

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
              {(_client) => (
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
              )}
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
            <CardTitle class="text-xl">
              {interpolateClient(localization.authorize, clientName())}
            </CardTitle>
            <CardDescription>
              {interpolateClient(
                localization.authorizationDescription,
                clientName()
              )}
            </CardDescription>
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
              when={request()}
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
                      const metadata = () => scopeMetadata[scope]

                      return (
                        <li class="flex gap-3">
                          <Check class="mt-0.5 size-4 shrink-0 text-primary" />
                          <div class="grid gap-0.5">
                            <p class="text-sm font-medium">
                              {metadata()?.label ?? scope}
                            </p>
                            <Show when={metadata()?.description}>
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

          <div class="flex items-center gap-3">
            <UserAvatar
              isPending={session.isPending}
              user={session.data?.user}
            />
            <div class="min-w-0 flex-1">
              <p class="text-muted-foreground text-xs">
                {localization.signedInAs}
              </p>
              <Show
                when={session.data}
                fallback={<Skeleton class="mt-1 h-4 w-40" />}
              >
                {(currentSession) => (
                  <>
                    <p class="truncate text-sm font-medium">
                      {currentSession().user.name ||
                        currentSession().user.email}
                    </p>
                    <Show when={currentSession().user.name}>
                      <p class="truncate text-muted-foreground text-xs">
                        {currentSession().user.email}
                      </p>
                    </Show>
                  </>
                )}
              </Show>
            </div>
          </div>

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
            onClick={() => consent.mutate({ accept: false })}
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
            onClick={() => consent.mutate({ accept: true })}
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
