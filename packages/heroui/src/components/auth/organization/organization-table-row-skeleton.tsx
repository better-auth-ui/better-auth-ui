import { Skeleton, Table } from "@heroui/react"
import { UserView } from "../user/user-view"
import type { ReactNode } from "react"

/** Placeholder cells for the table's current visible columns. */
export function OrganizationTableRowSkeleton({
  columnIds
}: {
  columnIds: readonly string[]
}) {
  const cells: Record<string, ReactNode> = {
    select: <Skeleton className="size-4 rounded-lg" />,
    user: <UserView isPending />,
    email: <Skeleton className="h-4 w-48 rounded-lg" />,
    createdAt: <Skeleton className="h-4 w-36 rounded-lg" />,
    role: <Skeleton className="h-4 w-16 rounded-lg" />,
    teams: <Skeleton className="h-4 w-24 rounded-lg" />,
    status: <Skeleton className="h-4 w-14 rounded-full" />,
    actions: (
      <div className="flex justify-end">
        <Skeleton className="size-8 rounded-lg" />
      </div>
    )
  }
  return (
    <Table.Row>
      {columnIds.map((id) => (
        <Table.Cell key={id}>{cells[id]}</Table.Cell>
      ))}
    </Table.Row>
  )
}
