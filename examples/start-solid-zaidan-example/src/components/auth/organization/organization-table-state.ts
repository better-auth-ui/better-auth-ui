import {
  parseTableColumnVisibility,
  parseTableUrlState,
  serializeTableColumnVisibility,
  serializeTableUrlState
} from "@better-auth-ui/core"
import { createAtom, useSelector } from "@tanstack/solid-store"
import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  functionalUpdate,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Updater
} from "@tanstack/solid-table"
import { createEffect, createSignal, onCleanup, onMount } from "solid-js"
import { ORGANIZATION_TABLE_PAGE_SIZE } from "./organization-table"

const STORAGE_PREFIX = "better-auth-ui:organization-table"

function readUrl(
  stateKey: string,
  defaultPageSize: number,
  allowedColumnIds?: readonly string[]
) {
  return parseTableUrlState(
    new URLSearchParams(window.location.search),
    stateKey,
    defaultPageSize,
    ORGANIZATION_TABLE_PAGE_SIZE_OPTIONS,
    allowedColumnIds
  )
}

export function createOrganizationTableState(
  stateKey: string,
  defaultPageSize = ORGANIZATION_TABLE_PAGE_SIZE,
  allowedColumnIds?: readonly string[]
) {
  const columnFiltersAtom = createAtom<ColumnFiltersState>([])
  const columnVisibilityAtom = createAtom<ColumnVisibilityState>({})
  const globalFilterAtom = createAtom("")
  const paginationAtom = createAtom<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize
  })
  const rowSelectionAtom = createAtom<RowSelectionState>({})
  const sortingAtom = createAtom<SortingState>([])
  const columnFilters = useSelector(columnFiltersAtom)
  const columnVisibility = useSelector(columnVisibilityAtom)
  const globalFilter = useSelector(globalFilterAtom)
  const pagination = useSelector(paginationAtom)
  const rowSelection = useSelector(rowSelectionAtom)
  const sorting = useSelector(sortingAtom)
  const [ready, setReady] = createSignal(false)
  const atoms = {
    columnFilters: columnFiltersAtom,
    globalFilter: globalFilterAtom,
    pagination: paginationAtom,
    rowSelection: rowSelectionAtom,
    sorting: sortingAtom
  }

  const setPagination = (updater: Updater<PaginationState>) => {
    paginationAtom.set((current) => functionalUpdate(updater, current))
  }
  const setColumnVisibility = (updater: Updater<ColumnVisibilityState>) => {
    columnVisibilityAtom.set((current) => functionalUpdate(updater, current))
  }
  const setColumnFilters = (updater: Updater<ColumnFiltersState>) => {
    columnFiltersAtom.set((current) => functionalUpdate(updater, current))
  }
  const setGlobalFilter = (updater: Updater<string>) => {
    globalFilterAtom.set((current) => functionalUpdate(updater, current))
  }
  const setSorting = (updater: Updater<SortingState>) => {
    sortingAtom.set((current) => functionalUpdate(updater, current))
  }

  onMount(() => {
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

    try {
      const saved = window.localStorage.getItem(
        `${STORAGE_PREFIX}:${stateKey}:columns`
      )
      columnVisibilityAtom.set(
        parseTableColumnVisibility(saved, allowedColumnIds)
      )
    } catch {
      // Storage is optional.
    }
    const restore = () => {
      const next = readUrl(stateKey, defaultPageSize, allowedColumnIds)
      columnFiltersAtom.set(next.columnFilters)
      globalFilterAtom.set(next.globalFilter)
      sortingAtom.set(next.sorting)
      paginationAtom.set(next.pagination)
      setReady(true)
    }
    restore()
    window.addEventListener("popstate", restore)
    onCleanup(() => {
      window.removeEventListener("popstate", restore)
      for (const subscription of subscriptions) subscription.unsubscribe()
    })
  })

  createEffect(() => {
    const visibility = columnVisibility()
    if (!ready()) return
    try {
      window.localStorage.setItem(
        `${STORAGE_PREFIX}:${stateKey}:columns`,
        serializeTableColumnVisibility(visibility)
      )
    } catch {
      // Storage is optional.
    }
  })

  createEffect(() => {
    const state = {
      columnFilters: columnFilters(),
      globalFilter: globalFilter(),
      pagination: pagination(),
      sorting: sorting()
    }
    if (!ready()) return
    const url = new URL(window.location.href)
    url.search = serializeTableUrlState(
      url.searchParams,
      stateKey,
      defaultPageSize,
      state
    ).toString()
    window.history.replaceState(window.history.state, "", url)
  })

  return {
    atoms,
    columnFilters,
    columnVisibility,
    globalFilter,
    pagination,
    ready,
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
