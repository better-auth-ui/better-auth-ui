import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  createTableHook,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures
} from "@tanstack/react-table"

export const ORGANIZATION_TABLE_PAGE_SIZE = 10

export const organizationTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  columnVisibilityFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature
})

export const {
  createAppColumnHelper: createOrganizationColumnHelper,
  useAppTable: useOrganizationTable
} = createTableHook({
  enableMultiSort: true,
  sortDescFirst: false,
  features: organizationTableFeatures
})
