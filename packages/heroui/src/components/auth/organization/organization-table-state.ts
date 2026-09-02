import {
  parseTableColumnVisibility,
  parseTableUrlState,
  serializeTableColumnVisibility,
  serializeTableUrlState,
  type TableUrlState
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
): TableUrlState {
  const params =
    typeof window === "undefined"
      ? new URLSearchParams()
      : new URLSearchParams(window.location.search)
  return parseTableUrlState(
    params,
    stateKey,
    defaultPageSize,
    ORGANIZATION_TABLE_PAGE_SIZE_OPTIONS,
    allowedColumnIds
  )
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

function writeUrlState(
  stateKey: string,
  defaultPageSize: number,
  state: OrganizationTableUrlState
) {
  if (typeof window === "undefined") return
  const url = new URL(window.location.href)
  url.search = serializeTableUrlState(
    url.searchParams,
    stateKey,
    defaultPageSize,
    state
  ).toString()
  window.history.replaceState(window.history.state, "", url)
}

export function useOrganizationTableState(
  stateKey: string,
  defaultPageSize = ORGANIZATION_TABLE_PAGE_SIZE,
  allowedColumnIds?: readonly string[]
) {
  const columnFiltersAtom = useCreateAtom<ColumnFiltersState>([])
  const columnVisibilityAtom = useCreateAtom<ColumnVisibilityState>({})
  const globalFilterAtom = useCreateAtom("")
  const paginationAtom = useCreateAtom<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize
  })
  const rowSelectionAtom = useCreateAtom<RowSelectionState>({})
  const sortingAtom = useCreateAtom<SortingState>([])
  const columnFilters = useSelector(columnFiltersAtom)
  const columnVisibility = useSelector(columnVisibilityAtom)
  const globalFilter = useSelector(globalFilterAtom)
  const pagination = useSelector(paginationAtom)
  const rowSelection = useSelector(rowSelectionAtom)
  const sorting = useSelector(sortingAtom)
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
    },
    [paginationAtom]
  )
  const setColumnVisibility = useCallback(
    (updater: Updater<ColumnVisibilityState>) => {
      columnVisibilityAtom.set((current) => functionalUpdate(updater, current))
    },
    [columnVisibilityAtom]
  )
  const setColumnFilters = useCallback(
    (updater: Updater<ColumnFiltersState>) => {
      columnFiltersAtom.set((current) => functionalUpdate(updater, current))
    },
    [columnFiltersAtom]
  )
  const setGlobalFilter = useCallback(
    (updater: Updater<string>) => {
      globalFilterAtom.set((current) => functionalUpdate(updater, current))
    },
    [globalFilterAtom]
  )
  const setSorting = useCallback(
    (updater: Updater<SortingState>) => {
      sortingAtom.set((current) => functionalUpdate(updater, current))
    },
    [sortingAtom]
  )

  useEffect(() => {
    const resetPage = () => {
      const current = paginationAtom.get()
      if (current.pageIndex === 0) rowSelectionAtom.set({})
      else paginationAtom.set({ ...current, pageIndex: 0 })
    }
    const subscriptions = [
      columnFiltersAtom.subscribe(resetPage),
      globalFilterAtom.subscribe(resetPage),
      sortingAtom.subscribe(resetPage),
      paginationAtom.subscribe(() => rowSelectionAtom.set({}))
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
    columnVisibilityAtom.set(readColumnVisibility(stateKey, allowedColumnIds))
    setVisibilityReady(true)
    const restoreUrlState = () => {
      const next = readUrlState(stateKey, defaultPageSize, allowedColumnIds)
      columnFiltersAtom.set(next.columnFilters)
      globalFilterAtom.set(next.globalFilter)
      sortingAtom.set(next.sorting)
      paginationAtom.set(next.pagination)
      setUrlReady(true)
    }
    restoreUrlState()
    window.addEventListener("popstate", restoreUrlState)
    return () => window.removeEventListener("popstate", restoreUrlState)
  }, [
    allowedColumnIds,
    columnFiltersAtom,
    columnVisibilityAtom,
    defaultPageSize,
    globalFilterAtom,
    paginationAtom,
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
