import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import { useActiveOrganization } from "@better-auth-ui/solid/plugins/organization"
import { useNavigate } from "@tanstack/solid-router"
import { Settings as SettingsIcon, Users as UsersIcon } from "lucide-solid"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrganizationPeople } from "./organization-people"
import { OrganizationSettings } from "./organization-settings"

export type OrganizationProps = {
  path: string
  slug?: string
}

export function Organization(props: OrganizationProps) {
  const navigate = useNavigate()
  const auth = useAuth<OrganizationAuthClient>()
  const activeOrganization = useActiveOrganization(auth.authClient)

  const handlePathChange = (path: string) => {
    if (!props.slug) return

    navigate({
      to: "/organization/$slug/$path",
      params: { slug: props.slug, path }
    })
  }

  return (
    <Tabs
      value={props.path}
      onChange={handlePathChange}
      class="w-full gap-4 md:gap-6"
    >
      <TabsList aria-label="Organization sections">
        <TabsTrigger value="settings">
          <SettingsIcon class="text-muted-foreground" />
          Settings
        </TabsTrigger>
        <TabsTrigger value="people">
          <UsersIcon class="text-muted-foreground" />
          People
        </TabsTrigger>
      </TabsList>

      {activeOrganization.data ? (
        <>
          <TabsContent value="settings" tabIndex={-1}>
            <OrganizationSettings />
          </TabsContent>

          <TabsContent value="people" tabIndex={-1}>
            <OrganizationPeople />
          </TabsContent>
        </>
      ) : (
        <div class="space-y-4">
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-32 w-full" />
        </div>
      )}
    </Tabs>
  )
}
