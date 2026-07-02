import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useListOrganizationMembers
} from "@better-auth-ui/react/plugins/organization"
import { type AvatarProps, Chip, cn } from "@heroui/react"
import type { Organization } from "better-auth/client"
import type { ComponentProps } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { OrganizationLogo } from "./organization-logo"
import { OrganizationViewSkeleton } from "./organization-view-skeleton"

export type OrganizationViewProps = {
  className?: string
  isPending?: boolean
  size?: AvatarProps["size"]
  hideRole?: boolean
  hideSlug?: boolean
  organization?: Partial<Organization>
}

/**
 * Compact organization row: logo, primary name, secondary slug — analogous to {@link UserView}.
 */
export function OrganizationView({
  className,
  isPending,
  size = "md",
  hideSlug,
  hideRole,
  organization,
  ...props
}: OrganizationViewProps & ComponentProps<"div">) {
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
        {...props}
      />
    )
  }

  return (
    <div
      className={cn("flex min-w-0 items-center gap-2", className)}
      {...props}
    >
      <OrganizationLogo
        organization={resolvedOrganization}
        className={size === "sm" ? "size-5 [&>span]:text-xs" : undefined}
        size={size === "lg" ? "md" : "sm"}
      />

      <div className="flex flex-col min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="text-foreground text-sm font-medium truncate leading-tight">
            {resolvedOrganization?.name}
          </p>

          {!hideRole && !!membership && (
            <Chip className="shrink-0 -my-0.5" size="sm">
              {roles?.[membership.role] ?? membership.role}
            </Chip>
          )}
        </div>

        {!hideSlug && !!resolvedOrganization?.slug && (
          <p className="text-muted text-xs truncate overflow-x-hidden font-mono leading-tight">
            {slugPrefix}
            {resolvedOrganization.slug}
          </p>
        )}
      </div>
    </div>
  )
}
