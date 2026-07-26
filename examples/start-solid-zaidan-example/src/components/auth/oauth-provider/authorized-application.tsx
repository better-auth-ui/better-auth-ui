import {
  type AuthorizedOAuthApplication,
  resolveOAuthScopeMetadata,
  sanitizeOAuthClientUrl
} from "@better-auth-ui/core/plugins"
import {
  type OAuthProviderAuthClient,
  useAuth,
  useAuthPlugin,
  usePublicOAuthClient
} from "@better-auth-ui/solid"
import { ShieldCheck } from "lucide-solid"
import { createSignal, For, Show } from "solid-js"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { oauthProviderPlugin } from "@/lib/auth/oauth-provider-plugin"
import { RemoveAuthorizationDialog } from "./remove-authorization-dialog"

export type AuthorizedApplicationProps = {
  /** @remarks `AuthorizedOAuthApplication` */
  application: AuthorizedOAuthApplication
}

/**
 * A single authorized application row.
 *
 * Each row loads its own public client metadata so one slow or missing
 * application never blocks the rest of the card.
 */
export function AuthorizedApplication(props: AuthorizedApplicationProps) {
  const auth = useAuth()
  const { localization, scopeMetadata } = useAuthPlugin(oauthProviderPlugin)
  const [removeOpen, setRemoveOpen] = createSignal(false)

  const publicClient = usePublicOAuthClient(
    auth.authClient as OAuthProviderAuthClient,
    () => props.application.clientId
  )

  const clientName = () =>
    publicClient.data?.client_name || props.application.clientId
  const logoUrl = () => sanitizeOAuthClientUrl(publicClient.data?.logo_uri)
  const websiteUrl = () => sanitizeOAuthClientUrl(publicClient.data?.client_uri)

  return (
    <div class="flex flex-wrap items-start gap-3 p-6">
      <Show
        when={!publicClient.isPending}
        fallback={<Skeleton class="size-10 shrink-0 rounded-md" />}
      >
        <Avatar class="size-10 shrink-0 rounded-md">
          <AvatarImage
            alt={clientName()}
            referrerpolicy="no-referrer"
            src={logoUrl()}
          />
          <AvatarFallback class="rounded-md">
            <ShieldCheck class="size-4.5" />
          </AvatarFallback>
        </Avatar>
      </Show>

      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <div class="flex min-w-0 flex-col">
          <Show
            when={!publicClient.isPending}
            fallback={<Skeleton class="h-4 w-32" />}
          >
            <span class="truncate font-medium text-sm leading-tight">
              {clientName()}
            </span>
          </Show>

          <Show when={websiteUrl()}>
            {(uri) => (
              <a
                class="truncate text-muted-foreground text-xs underline-offset-4 hover:underline"
                href={uri()}
                rel="noreferrer"
                target="_blank"
              >
                {uri()}
              </a>
            )}
          </Show>

          <Show when={props.application.updatedAt}>
            {(updatedAt) => (
              <span class="text-muted-foreground text-xs">
                {`${localization.lastAuthorized} ${updatedAt().toLocaleDateString(
                  undefined,
                  { dateStyle: "medium" }
                )}`}
              </span>
            )}
          </Show>
        </div>

        <Show when={props.application.scopes.length > 0}>
          <div class="flex flex-wrap gap-1.5">
            <For each={props.application.scopes}>
              {(scope) => (
                <Badge variant="secondary">
                  {
                    resolveOAuthScopeMetadata(scopeMetadata, scope, {
                      clientId: props.application.clientId,
                      requestedScopes: props.application.scopes
                    }).label
                  }
                </Badge>
              )}
            </For>
          </div>
        </Show>
      </div>

      <Dialog open={removeOpen()} onOpenChange={setRemoveOpen}>
        <DialogTrigger as={Button} class="shrink-0" size="sm" variant="outline">
          {localization.removeAuthorization}
        </DialogTrigger>

        <RemoveAuthorizationDialog
          application={props.application}
          clientName={clientName()}
          onOpenChange={setRemoveOpen}
        />
      </Dialog>
    </div>
  )
}
