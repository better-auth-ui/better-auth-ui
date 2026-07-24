"use client"

import {
  type OrganizationAuthClient,
  useAuth,
  useHasPermission
} from "@better-auth-ui/react"
import type { ComponentProps } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { DeleteOrganization } from "./delete-organization"
import { DeleteOrganizationSkeleton } from "./delete-organization-skeleton"
import { LeaveOrganization } from "./leave-organization"

export type OrganizationDangerZoneProps = {
  className?: string
}

/**
 * Danger zone heading with `LeaveOrganization` and `DeleteOrganization`
 * for the active organization in a single card.
 *
 * Resolves the `organization:delete` permission before rendering anything to
 * avoid flashing `LeaveOrganization` (and a stray separator) before the
 * delete row appears or disappears.
 */
export function OrganizationDangerZone({
  className,
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
      <h2 className="mb-3 text-sm font-semibold text-destructive">
        {localization.settings.dangerZone}
      </h2>

      <Card>
        <CardContent>
          {deletePermissionPending ? (
            <DeleteOrganizationSkeleton />
          ) : (
            <>
              <LeaveOrganization />

              {canDelete && (
                <>
                  <Separator className="my-4" />

                  <DeleteOrganization />
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
