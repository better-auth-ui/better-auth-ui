import {
  parseTableColumnVisibility,
  parseTableFilterValue,
  parseTablePage,
  parseTablePageSize,
  parseTableSorting,
  serializeTableColumnVisibility,
  serializeTableFilterValue
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
  const params = new URLSearchParams(window.location.search)
  const prefix = `${stateKey}.filter.`
  const filters: ColumnFiltersState = []
  for (const [key, value] of params) {
    const id = key.slice(prefix.length)
    if (
      key.startsWith(prefix) &&
      value &&
      (!allowedColumnIds || allowedColumnIds.includes(id))
    )
      filters.push({ id, value: parseTableFilterValue(value) })
  }
  return {
    columnFilters: filters,
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

function setOrDelete(
  params: URLSearchParams,
  key: string,
  value: string,
  fallback = ""
) {
  if (value === fallback) params.delete(key)
  else params.set(key, value)
}

export function createOrganizationTableState(
  stateKey: string,
  defaultPageSize = ORGANIZATION_TABLE_PAGE_SIZE,
  allowedColumnIds?: readonly string[]
) {
  const columnFiltersAtom = createAtom<ColumnFiltersState>([])
  const globalFilterAtom = createAtom("")
  const paginationAtom = createAtom<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize
  })
  const rowSelectionAtom = createAtom<RowSelectionState>({})
  const sortingAtom = createAtom<SortingState>([])
  const columnFilters = useSelector(columnFiltersAtom)
  const globalFilter = useSelector(globalFilterAtom)
  const pagination = useSelector(paginationAtom)
  const rowSelection = useSelector(rowSelectionAtom)
  const sorting = useSelector(sortingAtom)
  const [columnVisibility, setColumnVisibility] =
    createSignal<ColumnVisibilityState>({})
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
    rowSelectionAtom.set({})
  }
  const setColumnFilters = (updater: Updater<ColumnFiltersState>) => {
    columnFiltersAtom.set((current) => functionalUpdate(updater, current))
    paginationAtom.set((current) => ({ ...current, pageIndex: 0 }))
    rowSelectionAtom.set({})
  }
  const setGlobalFilter = (updater: Updater<string>) => {
    globalFilterAtom.set((current) => functionalUpdate(updater, current))
    paginationAtom.set((current) => ({ ...current, pageIndex: 0 }))
    rowSelectionAtom.set({})
  }
  const setSorting = (updater: Updater<SortingState>) => {
    sortingAtom.set((current) => functionalUpdate(updater, current))
    paginationAtom.set((current) => ({ ...current, pageIndex: 0 }))
    rowSelectionAtom.set({})
  }

  onMount(() => {
    const resetPageAndSelection = () => {
      paginationAtom.set((current) => ({ ...current, pageIndex: 0 }))
      rowSelectionAtom.set({})
    }
    const subscriptions = [
      columnFiltersAtom.subscribe(resetPageAndSelection),
      globalFilterAtom.subscribe(resetPageAndSelection),
      sortingAtom.subscribe(resetPageAndSelection)
    ]

    try {
      const saved = window.localStorage.getItem(
        `${STORAGE_PREFIX}:${stateKey}:columns`
      )
      setColumnVisibility(parseTableColumnVisibility(saved, allowedColumnIds))
    } catch {
      // Storage is optional.
    }
    const restore = () => {
      const next = readUrl(stateKey, defaultPageSize, allowedColumnIds)
      columnFiltersAtom.set(next.columnFilters)
      globalFilterAtom.set(next.globalFilter)
      sortingAtom.set(next.sorting)
      paginationAtom.set(next.pagination)
      rowSelectionAtom.set({})
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
    const prefix = `${stateKey}.filter.`
    for (const key of Array.from(url.searchParams.keys()))
      if (key.startsWith(prefix)) url.searchParams.delete(key)
    for (const filter of state.columnFilters) {
      const value = serializeTableFilterValue(filter.value)
      if (value) url.searchParams.set(`${prefix}${filter.id}`, value)
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
