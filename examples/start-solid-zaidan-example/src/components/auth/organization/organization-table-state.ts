import {
  parseTableColumnVisibility,
  parseTablePage,
  parseTablePageSize,
  parseTableSorting,
  serializeTableColumnVisibility
} from "@better-auth-ui/core"
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

function readUrl(stateKey: string, defaultPageSize: number) {
  const params = new URLSearchParams(window.location.search)
  const prefix = `${stateKey}.filter.`
  const filters: ColumnFiltersState = []
  for (const [key, value] of params) {
    if (key.startsWith(prefix) && value)
      filters.push({ id: key.slice(prefix.length), value })
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
    sorting: parseTableSorting(params.get(`${stateKey}.sort`))
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
  defaultPageSize = ORGANIZATION_TABLE_PAGE_SIZE
) {
  const [columnFilters, setColumnFiltersState] =
    createSignal<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    createSignal<ColumnVisibilityState>({})
  const [globalFilter, setGlobalFilterState] = createSignal("")
  const [pagination, setPaginationState] = createSignal<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize
  })
  const [rowSelection, setRowSelection] = createSignal<RowSelectionState>({})
  const [sorting, setSortingState] = createSignal<SortingState>([])
  const [ready, setReady] = createSignal(false)

  const setPagination = (updater: Updater<PaginationState>) => {
    setPaginationState((current) => functionalUpdate(updater, current))
    setRowSelection({})
  }
  const setColumnFilters = (updater: Updater<ColumnFiltersState>) => {
    setColumnFiltersState((current) => functionalUpdate(updater, current))
    setPaginationState((current) => ({ ...current, pageIndex: 0 }))
    setRowSelection({})
  }
  const setGlobalFilter = (updater: Updater<string>) => {
    setGlobalFilterState((current) => functionalUpdate(updater, current))
    setPaginationState((current) => ({ ...current, pageIndex: 0 }))
    setRowSelection({})
  }
  const setSorting = (updater: Updater<SortingState>) => {
    setSortingState((current) => functionalUpdate(updater, current))
    setPaginationState((current) => ({ ...current, pageIndex: 0 }))
    setRowSelection({})
  }

  onMount(() => {
    try {
      const saved = window.localStorage.getItem(
        `${STORAGE_PREFIX}:${stateKey}:columns`
      )
      setColumnVisibility(parseTableColumnVisibility(saved))
    } catch {
      // Storage is optional.
    }
    const restore = () => {
      const next = readUrl(stateKey, defaultPageSize)
      setColumnFiltersState(next.columnFilters)
      setGlobalFilterState(next.globalFilter)
      setPaginationState(next.pagination)
      setSortingState(next.sorting)
      setRowSelection({})
      setReady(true)
    }
    restore()
    window.addEventListener("popstate", restore)
    onCleanup(() => window.removeEventListener("popstate", restore))
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
      const value = String(filter.value ?? "")
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
    columnFilters,
    columnVisibility,
    globalFilter,
    pagination,
    rowSelection,
    sorting,
    setColumnFilters,
    setColumnVisibility,
    setGlobalFilter,
    setPagination,
    setRowSelection,
    setSorting
  }
}

export const ORGANIZATION_TABLE_PAGE_SIZE_OPTIONS = [10, 20, 50] as const
