import { createAtom, useSelector } from "@tanstack/solid-store"
import {
  type ColumnFiltersState,
  functionalUpdate,
  type PaginationState,
  type SortingState,
  type Updater
} from "@tanstack/solid-table"
import { onCleanup } from "solid-js"

export function createServerTableState({
  initialSorting = [],
  pageSize
}: {
  initialSorting?: SortingState
  pageSize: number
}) {
  const columnFiltersAtom = createAtom<ColumnFiltersState>([])
  const globalFilterAtom = createAtom("")
  const paginationAtom = createAtom<PaginationState>({
    pageIndex: 0,
    pageSize
  })
  const sortingAtom = createAtom<SortingState>(initialSorting)
  const columnFilters = useSelector(columnFiltersAtom)
  const globalFilter = useSelector(globalFilterAtom)
  const pagination = useSelector(paginationAtom)
  const sorting = useSelector(sortingAtom)
  const resetPage = () => {
    const current = paginationAtom.get()
    if (current.pageIndex !== 0) {
      paginationAtom.set({ ...current, pageIndex: 0 })
    }
  }
  const subscriptions = [
    columnFiltersAtom.subscribe(resetPage),
    globalFilterAtom.subscribe(resetPage),
    sortingAtom.subscribe(resetPage)
  ]
  onCleanup(() => {
    for (const subscription of subscriptions) subscription.unsubscribe()
  })

  const setPagination = (updater: Updater<PaginationState>) => {
    paginationAtom.set((current) => functionalUpdate(updater, current))
  }

  return {
    atoms: {
      columnFilters: columnFiltersAtom,
      globalFilter: globalFilterAtom,
      pagination: paginationAtom,
      sorting: sortingAtom
    },
    columnFilters,
    globalFilter,
    pagination,
    setPagination,
    sorting
  }
}
