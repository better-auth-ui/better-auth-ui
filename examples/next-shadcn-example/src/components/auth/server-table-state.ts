"use client"

import { useCreateAtom, useSelector } from "@tanstack/react-store"
import {
  type ColumnFiltersState,
  functionalUpdate,
  type PaginationState,
  type SortingState,
  type Updater
} from "@tanstack/react-table"
import { useCallback, useEffect, useMemo } from "react"

export function useServerTableState({
  initialSorting = [],
  pageSize
}: {
  initialSorting?: SortingState
  pageSize: number
}) {
  const columnFiltersAtom = useCreateAtom<ColumnFiltersState>([])
  const globalFilterAtom = useCreateAtom("")
  const paginationAtom = useCreateAtom<PaginationState>({
    pageIndex: 0,
    pageSize
  })
  const sortingAtom = useCreateAtom<SortingState>(initialSorting)
  const columnFilters = useSelector(columnFiltersAtom)
  const globalFilter = useSelector(globalFilterAtom)
  const pagination = useSelector(paginationAtom)
  const sorting = useSelector(sortingAtom)
  const atoms = useMemo(
    () => ({
      columnFilters: columnFiltersAtom,
      globalFilter: globalFilterAtom,
      pagination: paginationAtom,
      sorting: sortingAtom
    }),
    [columnFiltersAtom, globalFilterAtom, paginationAtom, sortingAtom]
  )

  useEffect(() => {
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

    return () => {
      for (const subscription of subscriptions) subscription.unsubscribe()
    }
  }, [columnFiltersAtom, globalFilterAtom, paginationAtom, sortingAtom])

  const setPagination = useCallback(
    (updater: Updater<PaginationState>) => {
      paginationAtom.set((current) => functionalUpdate(updater, current))
    },
    [paginationAtom]
  )

  return {
    atoms,
    columnFilters,
    globalFilter,
    pagination,
    setPagination,
    sorting
  }
}
