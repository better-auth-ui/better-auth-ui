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
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
    <Item>
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
      <ItemContent>
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
      </ItemContent>
      <ItemActions>
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
    </Item>
  )
}
