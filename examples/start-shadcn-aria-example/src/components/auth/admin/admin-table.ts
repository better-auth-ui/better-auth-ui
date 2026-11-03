"use client"

import {
  columnFilteringFeature,
  createTableHook,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures
} from "@tanstack/react-table"

export const {
  createAppColumnHelper: createAdminColumnHelper,
  useAppTable: useAdminTable
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
