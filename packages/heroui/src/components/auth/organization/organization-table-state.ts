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
} from "@tanstack/react-table"
import { useEffect, useState } from "react"
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
  defaultPageSize: number
): OrganizationTableUrlState {
  const params =
    typeof window === "undefined"
      ? new URLSearchParams()
      : new URLSearchParams(window.location.search)
  const filterPrefix = `${stateKey}.filter.`
  const columnFilters: ColumnFiltersState = []
  for (const [key, value] of params) {
    if (key.startsWith(filterPrefix) && value)
      columnFilters.push({ id: key.slice(filterPrefix.length), value })
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
    sorting: parseTableSorting(params.get(`${stateKey}.sort`))
  }
}

function readColumnVisibility(stateKey: string): ColumnVisibilityState {
  if (typeof window === "undefined") return {}
  try {
    const value = window.localStorage.getItem(
      `${TABLE_STATE_STORAGE_PREFIX}:${stateKey}:columns`
    )
    return parseTableColumnVisibility(value)
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
    const value = String(filter.value ?? "")
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
  defaultPageSize = ORGANIZATION_TABLE_PAGE_SIZE
) {
  const [columnFilters, setColumnFiltersState] = useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({})
  const [globalFilter, setGlobalFilterState] = useState("")
  const [pagination, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSortingState] = useState<SortingState>([])
  const [urlReady, setUrlReady] = useState(false)
  const [visibilityReady, setVisibilityReady] = useState(false)

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
    setColumnVisibility(readColumnVisibility(stateKey))
    setVisibilityReady(true)
    const restoreUrlState = () => {
      const next = readUrlState(stateKey, defaultPageSize)
      setColumnFiltersState(next.columnFilters)
      setGlobalFilterState(next.globalFilter)
      setPaginationState(next.pagination)
      setSortingState(next.sorting)
      setRowSelection({})
      setUrlReady(true)
    }
    restoreUrlState()
    window.addEventListener("popstate", restoreUrlState)
    return () => window.removeEventListener("popstate", restoreUrlState)
  }, [defaultPageSize, stateKey])

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
