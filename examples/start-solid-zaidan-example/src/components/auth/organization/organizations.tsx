import type {
  OrganizationAuthClient,
  OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { organizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import { useListOrganizations } from "@better-auth-ui/solid/plugins/organization"
import { createSignal, For, Show } from "solid-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { CreateOrganizationDialog } from "./create-organization-dialog"
import { OrganizationRow } from "./organization-row"
import { OrganizationViewSkeleton } from "./organization-view-skeleton"
import { OrganizationsEmpty } from "./organizations-empty"

export type OrganizationsProps = {
  class?: string
}

type OrganizationPluginConfig = {
  localization?: OrganizationLocalization
}

export function Organizations(props: OrganizationsProps = {}) {
  const auth = useAuth<OrganizationAuthClient>()
  const client = auth.authClient
  const localization = () =>
    (
      auth.plugins.find((plugin) => plugin.id === organizationPlugin.id) as
        | OrganizationPluginConfig
        | undefined
    )?.localization ?? organizationLocalization
  const organizations = useListOrganizations(client)
  const [createOpen, setCreateOpen] = createSignal(false)

  return (
    <>
      <div class={props.class}>
        <div class="flex flex-col gap-3">
          <div class="flex items-end justify-between gap-3">
            <h2 class="truncate font-semibold text-sm">
              {localization().organizations}
            </h2>

            <Button
              class="shrink-0"
              size="sm"
              disabled={organizations.isPending}
              onClick={() => setCreateOpen(true)}
            >
              {localization().createOrganization}
            </Button>
          </div>

          <Card class="z-card-padding-none">
            <CardContent class="z-card-content-padding-none">
              <Show
                when={!organizations.isPending}
                fallback={
                  <div class="p-4">
                    <OrganizationViewSkeleton />
                  </div>
                }
              >
                <Show
                  when={(organizations.data ?? []).length > 0}
                  fallback={
                    <OrganizationsEmpty
                      onCreatePress={() => setCreateOpen(true)}
                    />
                  }
                >
                  <For each={organizations.data ?? []}>
                    {(organization, index) => (
                      <>
                        <Show when={index() > 0}>
                          <Separator />
                        </Show>

                        <div class="p-4">
                          <OrganizationRow organization={organization} />
                        </div>
                      </>
                    )}
                  </For>
                </Show>
              </Show>
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateOrganizationDialog
        open={createOpen()}
        onOpenChange={setCreateOpen}
      />
    </>
  )
}
