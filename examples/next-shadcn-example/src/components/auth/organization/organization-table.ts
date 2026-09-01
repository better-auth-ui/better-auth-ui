"use client"

import {
  createPaginatedRowModel,
  createSortedRowModel,
  createTableHook,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures
} from "@tanstack/react-table"

export const ORGANIZATION_TABLE_PAGE_SIZE = 10

export const {
  createAppColumnHelper: createOrganizationColumnHelper,
  useAppTable: useOrganizationTable
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
