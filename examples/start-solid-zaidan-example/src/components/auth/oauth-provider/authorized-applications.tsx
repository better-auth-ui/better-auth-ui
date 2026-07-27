import { groupOAuthConsents } from "@better-auth-ui/core/plugins"
import {
  listOAuthConsentsOptions,
  type OAuthProviderAuthClient,
  useAuth,
  useAuthPlugin,
  useSession
} from "@better-auth-ui/solid"
import { createQuery } from "@tanstack/solid-query"
import { For, Show } from "solid-js"

import { Card, CardContent } from "@/components/ui/card"
import { ItemGroup, ItemSeparator } from "@/components/ui/item"
import { oauthProviderPlugin } from "@/lib/auth/oauth-provider-plugin"
import { cn } from "@/lib/utils"
import { AuthorizedApplication } from "./authorized-application"
import { AuthorizedApplicationSkeleton } from "./authorized-application-skeleton"
import { AuthorizedApplicationsEmpty } from "./authorized-applications-empty"

export type AuthorizedApplicationsProps = {
  class?: string
}

/**
 * Security card listing the OAuth applications this account has authorized.
 *
 * It manages consent records, not sign-in sessions and not live access
 * tokens. Better Auth can store more than one consent per client, so records
 * are grouped by client ID and rendered as a single application.
 */
export function AuthorizedApplications(
  props: AuthorizedApplicationsProps = {}
) {
  const auth = useAuth()
  const { localization } = useAuthPlugin(oauthProviderPlugin)
  const oauthClient = auth.authClient as OAuthProviderAuthClient
  const session = useSession(oauthClient)

  const consents = createQuery(() => ({
    ...listOAuthConsentsOptions(oauthClient, session.data?.user.id),
    enabled: Boolean(session.data?.user.id)
  }))

  const applications = () => groupOAuthConsents(consents.data)

  return (
    <div class={cn("flex flex-col gap-3", props.class)}>
      <h2 class="truncate font-semibold text-sm">
        {localization.connectedApplications}
      </h2>

      <Card class="z-card-padding-none">
        <CardContent class="z-card-content-padding-none">
          <Show
            when={!consents.isPending}
            fallback={<AuthorizedApplicationSkeleton />}
          >
            <Show
              when={applications().length > 0}
              fallback={<AuthorizedApplicationsEmpty />}
            >
              <ItemGroup class="gap-0">
                <For each={applications()}>
                  {(application, index) => (
                    <>
                      <Show when={index() > 0}>
                        <ItemSeparator />
                      </Show>
                      <AuthorizedApplication application={application} />
                    </>
                  )}
                </For>
              </ItemGroup>
            </Show>
          </Show>
        </CardContent>
      </Card>
    </div>
  )
}
