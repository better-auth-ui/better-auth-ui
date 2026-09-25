import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useListOrganizationMembers
} from "@better-auth-ui/react/plugins/organization"
import type { Organization } from "better-auth/client"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { cn } from "../../../lib/cn"
import { Box, Txt } from "../../../primitives/styled"
import { Chip } from "../../../primitives/tabs"
import { OrganizationLogo } from "./organization-logo"
import { OrganizationViewSkeleton } from "./organization-view-skeleton"

export type OrganizationViewProps = {
  className?: string
  isPending?: boolean
  size?: "sm" | "md" | "lg"
  hideRole?: boolean
  hideSlug?: boolean
  organization?: Partial<Organization>
}

/**
 * Compact organization row: logo, primary name, secondary slug — analogous to
 * `UserView`. Mirrors the heroui `OrganizationView`, adapted for React
 * Native: the `div`/`p` wrappers become `View`/`Text` and the role pill uses
 * the RN `Chip` primitive.
 */
export function OrganizationView({
  className,
  isPending,
  size = "md",
  hideSlug,
  hideRole,
  organization
}: OrganizationViewProps) {
  const { authClient } = useAuth()
  const { roles, slugPrefix } = useAuthPlugin(organizationPlugin)

  const { data: session } = useSession(authClient)

  const { data: activeOrganization, isPending: activeOrganizationPending } =
    useActiveOrganization(authClient as OrganizationAuthClient, {
      enabled: !organization && !isPending
    })

  const resolvedOrganization = organization ?? activeOrganization

  const { data: membersList, isPending: membersPending } =
    useListOrganizationMembers(authClient as OrganizationAuthClient, {
      query: {
        organizationId: resolvedOrganization?.id
      },
      enabled: !!resolvedOrganization?.id && !hideRole
    })

  const membership = membersList?.members?.find(
    (member) => member.userId === session?.user.id
  )

  if (
    isPending ||
    (!organization && activeOrganizationPending) ||
    (!hideRole && !!resolvedOrganization?.id && membersPending)
  ) {
    return (
      <OrganizationViewSkeleton
        className={className}
        hideSlug={hideSlug}
        size={size}
      />
    )
  }

  return (
    <Box className={cn("flex-row min-w-0 items-center gap-2", className)}>
      <OrganizationLogo
        organization={resolvedOrganization}
        className={size === "sm" ? "h-5 w-5" : undefined}
        size={size === "lg" ? "md" : "sm"}
      />

      <Box className="flex-col min-w-0">
        <Box className="flex-row min-w-0 items-center gap-2">
          <Txt
            numberOfLines={1}
            className="text-foreground text-sm font-medium leading-tight"
          >
            {resolvedOrganization?.name}
          </Txt>

          {!hideRole && !!membership && (
            <Chip className="shrink-0 -my-0.5">
              {roles?.[membership.role] ?? membership.role}
            </Chip>
          )}
        </Box>

        {!hideSlug && !!resolvedOrganization?.slug && (
          <Txt
            numberOfLines={1}
            className="text-muted text-xs font-mono leading-tight"
          >
            {slugPrefix}
            {resolvedOrganization.slug}
          </Txt>
        )}
      </Box>
    </Box>
  )
}
