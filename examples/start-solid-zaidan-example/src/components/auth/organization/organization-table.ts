import {
  createPaginatedRowModel,
  createSortedRowModel,
  createTableHook,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures
} from "@tanstack/solid-table"

export const ORGANIZATION_TABLE_PAGE_SIZE = 10

export const {
  createAppColumnHelper: createOrganizationColumnHelper,
  createAppTable: createOrganizationTable
} = createTableHook({
  enableMultiSort: true,
  sortDescFirst: false,
  features: tableFeatures({
    rowSortingFeature,
    sortedRowModel: createSortedRowModel(),
    rowPaginationFeature,
    paginatedRowModel: createPaginatedRowModel()
  })
})
