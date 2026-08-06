import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/react"
import { useHasPermission } from "@better-auth-ui/react/plugins/organization"
import { Card, type CardProps, cn } from "@heroui/react"
import type { ComponentProps } from "react"

import { DeleteOrganization } from "./delete-organization"
import { DeleteOrganizationSkeleton } from "./delete-organization-skeleton"
import { LeaveOrganization } from "./leave-organization"

export type OrganizationDangerZoneProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Danger zone heading with {@link LeaveOrganization} and {@link DeleteOrganization}
 * for the active organization in a single card.
 *
 * Resolves the `organization:delete` permission before rendering anything to
 * avoid flashing {@link LeaveOrganization} (and a stray separator) before the
 * delete row appears or disappears. Inner {@link DeleteOrganization} also
 * self-gates so it stays safe to use standalone.
 */
export function OrganizationDangerZone({
  className,
  variant,
  ...props
}: OrganizationDangerZoneProps & ComponentProps<"div">) {
  const { authClient, localization } = useAuth()

  const { data: deletePermission, isPending: deletePermissionPending } =
    useHasPermission(authClient as OrganizationAuthClient, {
      permissions: { organization: ["delete"] }
    })

  const canDelete = !!deletePermission?.success

  return (
    <div className={cn("flex w-full flex-col", className)} {...props}>
      <h2 className={cn("mb-3 text-sm font-semibold text-danger")}>
        {localization.settings.dangerZone}
      </h2>

      <Card variant={variant}>
        <Card.Content className="gap-0">
          {deletePermissionPending ? (
            <DeleteOrganizationSkeleton />
          ) : (
            <>
              <LeaveOrganization />

              {canDelete && (
                <>
                  <div className="border-b border-dashed -mx-4 my-4" />

                  <DeleteOrganization />
                </>
              )}
            </>
          )}
        </Card.Content>
      </Card>
    </div>
  )
}
