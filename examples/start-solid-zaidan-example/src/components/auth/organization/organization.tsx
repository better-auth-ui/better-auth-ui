import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useActiveOrganization } from "@better-auth-ui/solid/plugins/organization"
import {
  Settings as SettingsIcon,
  UsersRound as TeamsIcon,
  Users as UsersIcon
} from "lucide-solid"
import { For, Show } from "solid-js"
import { Dynamic } from "solid-js/web"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { createOrganizationPath } from "./organization-path"
import { OrganizationPeople } from "./organization-people"
import { OrganizationSettings } from "./organization-settings"
import { OrganizationTeams } from "./organization-teams"

export type OrganizationProps = {
  path: string
  slug?: string
}

export function Organization(props: OrganizationProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const config = useAuthPlugin(organizationPlugin)
  const activeOrganization = useActiveOrganization(auth.authClient)
  const extensionTabs = () =>
    auth.plugins.flatMap((plugin) => plugin.organizationTabs ?? [])

  const handlePathChange = (path: string) => {
    if (!props.slug) return

    auth.navigate({
      to: createOrganizationPath({
        basePath: auth.basePaths.organization,
        slugPrefix: config.slugPrefix,
        slug: props.slug,
        path
      })
    })
  }

  return (
    <Tabs
      value={props.path}
      onChange={handlePathChange}
      class="w-full gap-4 md:gap-6"
    >
      <TabsList aria-label="Organization sections">
        <TabsTrigger value={config.viewPaths.organization.settings}>
          <SettingsIcon class="text-muted-foreground" />
          Settings
        </TabsTrigger>
        <Show when={config.teams}>
          <TabsTrigger value={config.viewPaths.organization.teams}>
            <TeamsIcon class="text-muted-foreground" />
            {config.localization.teams}
          </TabsTrigger>
        </Show>
        <For each={extensionTabs()}>
          {(tab) => (
            <TabsTrigger value={tab.path}>
              <Dynamic component={tab.label} />
            </TabsTrigger>
          )}
        </For>
        <TabsTrigger value={config.viewPaths.organization.people}>
          <UsersIcon class="text-muted-foreground" />
          People
        </TabsTrigger>
      </TabsList>

      <Show
        when={activeOrganization.data}
        fallback={
          <div class="flex flex-col gap-4">
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-32 w-full" />
          </div>
        }
      >
        {(currentOrganization) => (
          <>
            <TabsContent
              value={config.viewPaths.organization.settings}
              tabIndex={-1}
            >
              <OrganizationSettings />
            </TabsContent>

            <TabsContent
              value={config.viewPaths.organization.people}
              tabIndex={-1}
            >
              <OrganizationPeople organizationId={currentOrganization().id} />
            </TabsContent>
            <Show when={config.teams}>
              <TabsContent
                value={config.viewPaths.organization.teams}
                tabIndex={-1}
              >
                <OrganizationTeams />
              </TabsContent>
            </Show>
            <For each={extensionTabs()}>
              {(tab) => (
                <TabsContent value={tab.path} tabIndex={-1}>
                  <Dynamic
                    component={tab.component}
                    organizationId={currentOrganization().id}
                    organizationSlug={currentOrganization().slug}
                  />
                </TabsContent>
              )}
            </For>
          </>
        )}
      </Show>
    </Tabs>
  )
}
