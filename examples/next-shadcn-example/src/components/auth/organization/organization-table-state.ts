"use client"

import {
  parseTableColumnVisibility,
  parseTableFilterValue,
  parseTablePage,
  parseTablePageSize,
  parseTableSorting,
  serializeTableColumnVisibility,
  serializeTableFilterValue
} from "@better-auth-ui/core"
import { useCreateAtom, useSelector } from "@tanstack/react-store"
import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  functionalUpdate,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Updater
} from "@tanstack/react-table"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ORGANIZATION_TABLE_PAGE_SIZE } from "./organization-table"

const TABLE_STATE_STORAGE_PREFIX = "better-auth-ui:organization-table"

type OrganizationTableUrlState = {
  columnFilters: ColumnFiltersState
  globalFilter: string
  pagination: PaginationState
  sorting: SortingState
}

function readUrlState(
  stateKey: string,
  defaultPageSize: number,
  allowedColumnIds?: readonly string[]
): OrganizationTableUrlState {
  const params =
    typeof window === "undefined"
      ? new URLSearchParams()
      : new URLSearchParams(window.location.search)
  const filterPrefix = `${stateKey}.filter.`
  const columnFilters: ColumnFiltersState = []

  for (const [key, value] of params) {
    const id = key.slice(filterPrefix.length)
    if (
      key.startsWith(filterPrefix) &&
      value &&
      (!allowedColumnIds || allowedColumnIds.includes(id))
    ) {
      columnFilters.push({ id, value: parseTableFilterValue(value) })
    }
  }

  return {
    columnFilters,
    globalFilter: params.get(`${stateKey}.search`) ?? "",
    pagination: {
      pageIndex: parseTablePage(params.get(`${stateKey}.page`), 1) - 1,
      pageSize: parseTablePageSize(
        params.get(`${stateKey}.pageSize`),
        defaultPageSize,
        ORGANIZATION_TABLE_PAGE_SIZE_OPTIONS
      )
    },
    sorting: parseTableSorting(params.get(`${stateKey}.sort`), allowedColumnIds)
  }
}

function readColumnVisibility(
  stateKey: string,
  allowedColumnIds?: readonly string[]
): ColumnVisibilityState {
  if (typeof window === "undefined") return {}

  try {
    const value = window.localStorage.getItem(
      `${TABLE_STATE_STORAGE_PREFIX}:${stateKey}:columns`
    )
    return parseTableColumnVisibility(value, allowedColumnIds)
  } catch {
    return {}
  }
}

function setOrDelete(
  params: URLSearchParams,
  key: string,
  value: string,
  defaultValue = ""
) {
  if (value === defaultValue) params.delete(key)
  else params.set(key, value)
}

function writeUrlState(
  stateKey: string,
  defaultPageSize: number,
  state: OrganizationTableUrlState
) {
  if (typeof window === "undefined") return

  const url = new URL(window.location.href)
  const filterPrefix = `${stateKey}.filter.`

  for (const key of Array.from(url.searchParams.keys())) {
    if (key.startsWith(filterPrefix)) url.searchParams.delete(key)
  }

  for (const filter of state.columnFilters) {
    const value = serializeTableFilterValue(filter.value)
    if (value) url.searchParams.set(`${filterPrefix}${filter.id}`, value)
  }

  setOrDelete(url.searchParams, `${stateKey}.search`, state.globalFilter)
  setOrDelete(
    url.searchParams,
    `${stateKey}.page`,
    String(state.pagination.pageIndex + 1),
    "1"
  )
  setOrDelete(
    url.searchParams,
    `${stateKey}.pageSize`,
    String(state.pagination.pageSize),
    String(defaultPageSize)
  )
  setOrDelete(
    url.searchParams,
    `${stateKey}.sort`,
    state.sorting
      .map(({ desc, id }) => `${id}.${desc ? "desc" : "asc"}`)
      .join(",")
  )

  window.history.replaceState(window.history.state, "", url)
}

export function useOrganizationTableState(
  stateKey: string,
  defaultPageSize = ORGANIZATION_TABLE_PAGE_SIZE,
  allowedColumnIds?: readonly string[]
) {
  const columnFiltersAtom = useCreateAtom<ColumnFiltersState>([])
  const globalFilterAtom = useCreateAtom("")
  const paginationAtom = useCreateAtom<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize
  })
  const rowSelectionAtom = useCreateAtom<RowSelectionState>({})
  const sortingAtom = useCreateAtom<SortingState>([])
  const columnFilters = useSelector(columnFiltersAtom)
  const globalFilter = useSelector(globalFilterAtom)
  const pagination = useSelector(paginationAtom)
  const rowSelection = useSelector(rowSelectionAtom)
  const sorting = useSelector(sortingAtom)
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({})
  const [urlReady, setUrlReady] = useState(false)
  const [visibilityReady, setVisibilityReady] = useState(false)
  const atoms = useMemo(
    () => ({
      columnFilters: columnFiltersAtom,
      globalFilter: globalFilterAtom,
      pagination: paginationAtom,
      rowSelection: rowSelectionAtom,
      sorting: sortingAtom
    }),
    [
      columnFiltersAtom,
      globalFilterAtom,
      paginationAtom,
      rowSelectionAtom,
      sortingAtom
    ]
  )

  const setPagination = useCallback(
    (updater: Updater<PaginationState>) => {
      paginationAtom.set((current) => functionalUpdate(updater, current))
      rowSelectionAtom.set({})
    },
    [paginationAtom, rowSelectionAtom]
  )

  const setColumnFilters = useCallback(
    (updater: Updater<ColumnFiltersState>) => {
      columnFiltersAtom.set((current) => functionalUpdate(updater, current))
      paginationAtom.set((current) => ({ ...current, pageIndex: 0 }))
      rowSelectionAtom.set({})
    },
    [columnFiltersAtom, paginationAtom, rowSelectionAtom]
  )

  const setGlobalFilter = useCallback(
    (updater: Updater<string>) => {
      globalFilterAtom.set((current) => functionalUpdate(updater, current))
      paginationAtom.set((current) => ({ ...current, pageIndex: 0 }))
      rowSelectionAtom.set({})
    },
    [globalFilterAtom, paginationAtom, rowSelectionAtom]
  )

  const setSorting = useCallback(
    (updater: Updater<SortingState>) => {
      sortingAtom.set((current) => functionalUpdate(updater, current))
      paginationAtom.set((current) => ({ ...current, pageIndex: 0 }))
      rowSelectionAtom.set({})
    },
    [paginationAtom, rowSelectionAtom, sortingAtom]
  )

  useEffect(() => {
    const resetPageAndSelection = () => {
      paginationAtom.set((current) => ({ ...current, pageIndex: 0 }))
      rowSelectionAtom.set({})
    }
    const subscriptions = [
      columnFiltersAtom.subscribe(resetPageAndSelection),
      globalFilterAtom.subscribe(resetPageAndSelection),
      sortingAtom.subscribe(resetPageAndSelection)
    ]

    return () => {
      for (const subscription of subscriptions) subscription.unsubscribe()
    }
  }, [
    columnFiltersAtom,
    globalFilterAtom,
    paginationAtom,
    rowSelectionAtom,
    sortingAtom
  ])

  useEffect(() => {
    if (!urlReady) return

    writeUrlState(stateKey, defaultPageSize, {
      columnFilters,
      globalFilter,
      pagination,
      sorting
    })
  }, [
    columnFilters,
    defaultPageSize,
    globalFilter,
    pagination,
    sorting,
    stateKey,
    urlReady
  ])

  useEffect(() => {
    if (!visibilityReady) return

    try {
      window.localStorage.setItem(
        `${TABLE_STATE_STORAGE_PREFIX}:${stateKey}:columns`,
        serializeTableColumnVisibility(columnVisibility)
      )
    } catch {
      // Browsers can disable storage while still allowing the table to work.
    }
  }, [columnVisibility, stateKey, visibilityReady])

  useEffect(() => {
    setColumnVisibility(readColumnVisibility(stateKey, allowedColumnIds))
    setVisibilityReady(true)

    const restoreUrlState = () => {
      const next = readUrlState(stateKey, defaultPageSize, allowedColumnIds)
      columnFiltersAtom.set(next.columnFilters)
      globalFilterAtom.set(next.globalFilter)
      sortingAtom.set(next.sorting)
      paginationAtom.set(next.pagination)
      rowSelectionAtom.set({})
      setUrlReady(true)
    }

    restoreUrlState()
    window.addEventListener("popstate", restoreUrlState)
    return () => window.removeEventListener("popstate", restoreUrlState)
  }, [
    allowedColumnIds,
    columnFiltersAtom,
    defaultPageSize,
    globalFilterAtom,
    paginationAtom,
    rowSelectionAtom,
    sortingAtom,
    stateKey
  ])

  return {
    atoms,
    columnFilters,
    columnVisibility,
    globalFilter,
    pagination,
    ready: urlReady && visibilityReady,
    rowSelection,
    sorting,
    setColumnFilters,
    setColumnVisibility,
    setGlobalFilter,
    setPagination,
    setRowSelection: rowSelectionAtom.set,
    setSorting
  }
}

export const ORGANIZATION_TABLE_PAGE_SIZE_OPTIONS = [10, 20, 50] as const
