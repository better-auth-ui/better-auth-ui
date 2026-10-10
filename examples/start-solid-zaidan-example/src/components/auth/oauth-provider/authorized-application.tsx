import {
  type AuthorizedOAuthApplication,
  type OAuthProviderAuthClient,
  resolveOAuthScopeMetadata,
  sanitizeOAuthClientUrl
} from "@better-auth-ui/core/plugins/oauth-provider"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { usePublicOAuthClient } from "@better-auth-ui/solid/plugins/oauth-provider"
import { ShieldCheck, ChevronRight, Check } from "lucide-solid"
import { createSignal, For, Show } from "solid-js"
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
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
    <Item class="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-4 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <ItemMedia variant="image">
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
      </ItemMedia>
      <ItemContent class="min-w-0">
        <Show
          when={!publicClient.isPending}
          fallback={<Skeleton class="h-4 w-32" />}
        >
          <ItemTitle>{clientName()}</ItemTitle>
        </Show>

        <Show when={websiteUrl()}>
          {(uri) => (
            <ItemDescription>
              <a
                class="truncate text-muted-foreground text-xs underline-offset-4 hover:underline"
                href={uri()}
                rel="noreferrer"
                target="_blank"
              >
                {uri()}
              </a>
            </ItemDescription>
          )}
        </Show>

        <Show when={props.application.updatedAt}>
          {(updatedAt) => (
            <ItemDescription>
              {`${localization.lastAuthorized} ${updatedAt().toLocaleDateString(
                undefined,
                { dateStyle: "medium" }
              )}`}
            </ItemDescription>
          )}
        </Show>
      </ItemContent>
      <ItemActions class="col-start-2 sm:col-start-3 sm:row-start-1">
        <AlertDialog open={removeOpen()} onOpenChange={setRemoveOpen}>
          <AlertDialogTrigger as={Button} size="sm" variant="outline">
            {localization.removeAuthorization}
          </AlertDialogTrigger>

          <RemoveAuthorizationDialog
            application={props.application}
            clientName={clientName()}
            onOpenChange={setRemoveOpen}
          />
        </AlertDialog>
      </ItemActions>
      {props.application.scopes.length > 0 ? (
        <details class="group/permissions col-span-full sm:col-start-2 sm:col-span-2">
          <summary class="flex w-fit cursor-pointer list-none items-center gap-2 rounded-sm text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
            <ChevronRight
              aria-hidden="true"
              class="size-4 shrink-0 group-open/permissions:rotate-90"
            />
            {localization.permissions}{" "}
            <span>({props.application.scopes.length})</span>
          </summary>
          <ul class="mt-3 grid gap-3 rounded-lg bg-muted/50 p-4">
            <For each={props.application.scopes}>
              {(scope) => {
                const details = resolveOAuthScopeMetadata(
                  scopeMetadata,
                  scope,
                  {
                    clientId: props.application.clientId,
                    requestedScopes: props.application.scopes
                  }
                )
                return (
                  <li class="flex gap-3">
                    <Check
                      aria-hidden="true"
                      class="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    />
                    <div class="grid min-w-0 gap-1">
                      <p class="text-sm font-medium break-words">
                        {details.label}
                      </p>
                      {details.description ? (
                        <p class="text-sm leading-5 text-muted-foreground">
                          {details.description}
                        </p>
                      ) : null}
                    </div>
                  </li>
                )
              }}
            </For>
          </ul>
        </details>
      ) : null}
    </Item>
  )
}
