import type {
  OrganizationAuthClient,
  OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { organizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useSession } from "@better-auth-ui/solid"
import {
  useActiveOrganization,
  useListOrganizationMembers
} from "@better-auth-ui/solid/plugins/organization"
import type { Organization } from "better-auth/client"
import type { ComponentProps } from "solid-js"
import { Show, splitProps } from "solid-js"
import { Badge } from "@/components/ui/badge"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@/lib/utils"
import {
  OrganizationLogo,
  type OrganizationLogoSize
} from "./organization-logo"
import { OrganizationViewSkeleton } from "./organization-view-skeleton"

type OrganizationPluginConfig = {
  roles?: Record<string, string>
  localization?: OrganizationLocalization
}

type OrganizationMember = {
  userId: string
  role: string
}

export type OrganizationViewProps = ComponentProps<"div"> & {
  isPending?: boolean
  size?: OrganizationLogoSize
  hideRole?: boolean
  hideSlug?: boolean
  organization?: Partial<Organization> | null
}

export function OrganizationView(props: OrganizationViewProps) {
  const [local, others] = splitProps(props, [
    "class",
    "isPending",
    "size",
    "hideRole",
    "hideSlug",
    "organization"
  ])
  const auth = useAuth<OrganizationAuthClient>()
  const client = auth.authClient
  const pluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === organizationPlugin.id) as
      | OrganizationPluginConfig
      | undefined
  const roles = () =>
    pluginConfig()?.roles ?? {
      owner: organizationLocalization.owner,
      admin: organizationLocalization.admin,
      member: organizationLocalization.member
    }
  const session = useSession(client)
  const activeOrganization = useActiveOrganization(client, () => ({
    enabled: !local.organization && !local.isPending
  }))
  const resolvedOrganization = () =>
    local.organization ?? activeOrganization.data
  const membersList = useListOrganizationMembers(client, () => ({
    query: { organizationId: resolvedOrganization()?.id },
    enabled: !!resolvedOrganization()?.id && !local.hideRole
  }))
  const membership = () =>
    (membersList.data?.members as OrganizationMember[] | undefined)?.find(
      (member) => member.userId === session.data?.user.id
    )

  return (
    <Show
      when={
        !local.isPending &&
        (local.organization || !activeOrganization.isPending) &&
        (local.hideRole ||
          !resolvedOrganization()?.id ||
          !membersList.isPending)
      }
      fallback={
        <OrganizationViewSkeleton
          class={local.class}
          hideSlug={local.hideSlug}
          size={local.size}
        />
      }
    >
      <div
        class={cn("flex min-w-0 items-center gap-2", local.class)}
        {...others}
      >
        <OrganizationLogo
          organization={resolvedOrganization()}
          class={local.size === "sm" ? "size-5" : undefined}
          size={local.size === "lg" ? "md" : "sm"}
        />

        <div class="flex min-w-0 flex-col">
          <div class="flex min-w-0 items-center gap-2">
            <p class="truncate text-sm font-medium leading-tight text-foreground">
              {resolvedOrganization()?.name}
            </p>

            <Show when={!local.hideRole && membership()}>
              {(member) => (
                <Badge variant="secondary" class="-my-0.5 shrink-0">
                  {roles()[member().role] ?? member().role}
                </Badge>
              )}
            </Show>
          </div>

          <Show when={!local.hideSlug}>
            <p class="truncate overflow-x-hidden font-mono text-muted-foreground text-xs leading-tight">
              {resolvedOrganization()?.slug}
            </p>
          </Show>
        </div>
      </div>
    </Show>
  )
}
