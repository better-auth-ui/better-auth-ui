import {
  columnFilteringFeature,
  createTableHook,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures
} from "@tanstack/react-table"

export const {
  createAppColumnHelper: createServerColumnHelper,
  useAppTable: useServerTable
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
