import {
  createBrowserTablePersistenceAdapters,
  parseTableColumnVisibility,
  parseTableUrlState,
  serializeTableColumnVisibility,
  serializeTableUrlState,
  type TablePersistenceAdapters
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
import {
  type MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { ORGANIZATION_TABLE_PAGE_SIZE } from "./organization-table"

const TABLE_STATE_STORAGE_PREFIX = "better-auth-ui:organization-table"

type OrganizationTableUrlState = {
  columnFilters: ColumnFiltersState
  globalFilter: string
  pagination: PaginationState
  sorting: SortingState
}

function readColumnVisibility(
  adapters: TablePersistenceAdapters,
  stateKey: string,
  allowedColumnIds?: readonly string[]
): ColumnVisibilityState {
  try {
    const value =
      adapters.storage?.read(
        `${TABLE_STATE_STORAGE_PREFIX}:${stateKey}:columns`
      ) ?? null
    return parseTableColumnVisibility(value, allowedColumnIds)
  } catch {
    return {}
  }
}

function writeUrlState(
  adapters: TablePersistenceAdapters,
  stateKey: string,
  defaultPageSize: number,
  state: OrganizationTableUrlState,
  syncedSearch: MutableRefObject<string>
) {
  const next = serializeTableUrlState(
    adapters.search.read(),
    stateKey,
    defaultPageSize,
    state
  )
  const nextSearch = next.toString()
  if (nextSearch === syncedSearch.current) return

  syncedSearch.current = nextSearch
  adapters.search.replace(next)
}

export function useOrganizationTableState(
  stateKey: string,
  defaultPageSize = ORGANIZATION_TABLE_PAGE_SIZE,
  allowedColumnIds?: readonly string[],
  persistenceAdapters?: TablePersistenceAdapters
) {
  const allowedColumnIdsKey = allowedColumnIds?.join("\u0000")
  const stableAllowedColumnIds = useMemo(
    () => allowedColumnIdsKey?.split("\u0000"),
    [allowedColumnIdsKey]
  )
  const adapters = useMemo(
    () => persistenceAdapters ?? createBrowserTablePersistenceAdapters(),
    [persistenceAdapters]
  )
  const urlStateToken = useMemo(
    () => ({ adapters, defaultPageSize, stableAllowedColumnIds, stateKey }),
    [adapters, defaultPageSize, stableAllowedColumnIds, stateKey]
  )
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
  const [restoredUrlStateToken, setRestoredUrlStateToken] =
    useState<typeof urlStateToken>()
  const [visibilityReady, setVisibilityReady] = useState(false)
  const urlReady = restoredUrlStateToken === urlStateToken
  const restoringUrlState = useRef(false)
  const syncedSearch = useRef("")
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
      if (restoringUrlState.current) return
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
    writeUrlState(
      adapters,
      stateKey,
      defaultPageSize,
      {
        columnFilters,
        globalFilter,
        pagination,
        sorting
      },
      syncedSearch
    )
  }, [
    adapters,
    columnFilters,
    defaultPageSize,
    globalFilter,
    pagination,
    sorting,
    stateKey,
    urlReady
  ])

  useEffect(() => {
    if (!urlReady || !visibilityReady) return
    try {
      adapters.storage?.write(
        `${TABLE_STATE_STORAGE_PREFIX}:${stateKey}:columns`,
        serializeTableColumnVisibility(columnVisibility)
      )
    } catch {
      // Browsers can disable storage while still allowing the table to work.
    }
  }, [adapters, columnVisibility, stateKey, urlReady, visibilityReady])

  useEffect(() => {
    setRestoredUrlStateToken(undefined)
    setVisibilityReady(false)
    columnVisibilityAtom.set(
      readColumnVisibility(adapters, stateKey, stableAllowedColumnIds)
    )
    setVisibilityReady(true)
    const restoreUrlState = () => {
      restoringUrlState.current = true
      const search = adapters.search.read()
      syncedSearch.current = search.toString()
      const next = parseTableUrlState(
        search,
        stateKey,
        defaultPageSize,
        ORGANIZATION_TABLE_PAGE_SIZE_OPTIONS,
        stableAllowedColumnIds
      )
      columnFiltersAtom.set(next.columnFilters)
      globalFilterAtom.set(next.globalFilter)
      sortingAtom.set(next.sorting)
      paginationAtom.set(next.pagination)
      restoringUrlState.current = false
      setRestoredUrlStateToken(urlStateToken)
    }
    restoreUrlState()
    return adapters.search.subscribe(restoreUrlState)
  }, [
    adapters,
    columnFiltersAtom,
    columnVisibilityAtom,
    defaultPageSize,
    globalFilterAtom,
    paginationAtom,
    sortingAtom,
    stableAllowedColumnIds,
    stateKey,
    urlStateToken
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
