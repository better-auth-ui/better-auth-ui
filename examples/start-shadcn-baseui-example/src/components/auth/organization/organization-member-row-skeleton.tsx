"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"
import { UserView } from "../user/user-view"

/**
 * Placeholder row matching `OrganizationMemberRow` while members load.
 */
export function OrganizationMemberRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <UserView isPending />
      </TableCell>

      <TableCell>
        <Skeleton className="h-4 w-18 rounded-md" />
      </TableCell>

      <TableCell className="flex justify-end">
        <Skeleton className="size-8 rounded-md" />
      </TableCell>
    </TableRow>
  )
}
