import type {
  OrganizationAuthClient,
  OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import { useHasPermission } from "@better-auth-ui/solid/plugins/organization"
import { Show } from "solid-js"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@/lib/utils"
import { DeleteOrganization } from "./delete-organization"
import { LeaveOrganization } from "./leave-organization"

export type OrganizationDangerZoneProps = {
  class?: string
}

const fallbackLocalization = {
  deleteOrganization: "Delete organization",
  deleteOrganizationDescription:
    "Permanently delete this organization and all of its data. All members will lose access and this cannot be undone.",
  leaveOrganization: "Leave organization",
  leaveOrganizationDescription:
    "Leave this organization. You will lose access to shared resources until another member invites you again.",
  leftOrganization: "Left organization",
  organizationDeleted: "Organization deleted"
} satisfies Pick<
  OrganizationLocalization,
  | "deleteOrganization"
  | "deleteOrganizationDescription"
  | "leaveOrganization"
  | "leaveOrganizationDescription"
  | "leftOrganization"
  | "organizationDeleted"
>

export function OrganizationDangerZone(props: OrganizationDangerZoneProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const deletePermission = useHasPermission(auth.authClient, () => ({
    permissions: { organization: ["delete"] }
  }))
  const organizationPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === organizationPlugin.id) as
      | {
          localization?: Pick<
            OrganizationLocalization,
            | "deleteOrganization"
            | "deleteOrganizationDescription"
            | "leaveOrganization"
            | "leaveOrganizationDescription"
            | "leftOrganization"
            | "organizationDeleted"
          >
        }
      | undefined
  const localization = () =>
    organizationPluginConfig()?.localization ?? fallbackLocalization

  return (
    <div class={cn("flex w-full flex-col", props.class)}>
      <h2 class="mb-3 font-semibold text-destructive text-sm">
        {auth.localization.settings.dangerZone}
      </h2>
      <Card>
        <CardContent>
          <Show
            when={!deletePermission.isPending}
            fallback={
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="grid gap-1">
                  <Skeleton class="h-4 w-36 rounded-md" />
                  <Skeleton class="h-3 w-64 rounded-md" />
                </div>
                <Skeleton class="h-8 w-32 rounded-md" />
              </div>
            }
          >
            <LeaveOrganization localization={localization()} />
            <Show when={deletePermission.data?.success}>
              <Separator class="my-4" />
              <DeleteOrganization localization={localization()} />
            </Show>
          </Show>
        </CardContent>
      </Card>
    </div>
  )
}
