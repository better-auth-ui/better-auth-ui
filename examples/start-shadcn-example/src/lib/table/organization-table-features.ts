import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  type RowData,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_datetime,
  tableFeatures
} from "@tanstack/react-table"

/**
 * Shared TanStack Table features for the organization members and
 * invitations data tables: client-side sorting and client-side pagination.
 */
export const organizationTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, datetime: sortFn_datetime },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel()
})

export const createOrganizationColumnHelper = <TData extends RowData>() =>
  createColumnHelper<typeof organizationTableFeatures, TData>()

/** Rows per page for organization data tables. */
export const ORGANIZATION_TABLE_PAGE_SIZE = 10
