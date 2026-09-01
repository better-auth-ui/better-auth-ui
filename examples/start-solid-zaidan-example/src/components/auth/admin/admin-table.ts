import {
  columnFilteringFeature,
  createTableHook,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures
} from "@tanstack/solid-table"

export const {
  createAppColumnHelper: createAdminColumnHelper,
  createAppTable: createAdminTable
} = createTableHook({
  enableMultiSort: false,
  enableSortingRemoval: false,
  sortDescFirst: false,
  features: tableFeatures({
    columnFilteringFeature,
    globalFilteringFeature,
    rowPaginationFeature,
    rowSortingFeature
  })
})
