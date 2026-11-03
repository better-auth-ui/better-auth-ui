"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"
import { UserView } from "../user/user-view"
import type { ReactNode } from "react"

/** Placeholder cells for the table's current visible columns. */
export function OrganizationTableRowSkeleton({
  columnIds
}: {
  columnIds: readonly string[]
}) {
  const cells: Record<string, ReactNode> = {
    select: <Skeleton className="size-4 rounded-md" />,
    user: <UserView isPending />,
    email: <Skeleton className="h-4 w-48 rounded-md" />,
    createdAt: <Skeleton className="h-4 w-36 rounded-md" />,
    role: <Skeleton className="h-4 w-16 rounded-md" />,
    teams: <Skeleton className="h-4 w-24 rounded-md" />,
    status: <Skeleton className="h-4 w-14 rounded-full" />,
    actions: (
      <div className="flex justify-end">
        <Skeleton className="size-8 rounded-md" />
      </div>
    )
  }
  return (
    <TableRow>
      {columnIds.map((id) => (
        <TableCell key={id}>{cells[id]}</TableCell>
      ))}
    </TableRow>
  )
}
