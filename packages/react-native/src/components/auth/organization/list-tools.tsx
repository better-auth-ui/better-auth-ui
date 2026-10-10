import { useState, type ReactNode } from "react"
import { useAuthPlugin } from "@better-auth-ui/react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { Button } from "../../../primitives/button"
import { Checkbox } from "../../../primitives/checkbox"
import { Select, Menu } from "../../../primitives/menu"
import { Box, Txt } from "../../../primitives/styled"

export function useNativeList<T extends { id: string }>(
  items: readonly T[],
  columns: Record<string, string>,
  sorters: Record<string, (a: T, b: T) => number>,
  pageSize = 10
) {
  const [sort, setSort] = useState(Object.keys(sorters)[0] ?? "")
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [visible, setVisible] = useState(Object.keys(columns))
  const sorted = [...items].sort(sorters[sort])
  const lastPage = Math.max(0, Math.ceil(sorted.length / pageSize) - 1)
  const currentPage = Math.min(page, lastPage)
  const rows = sorted.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  )
  return {
    rows,
    sort,
    setSort: (value: string) => {
      setSort(value)
      setPage(0)
    },
    page: currentPage,
    setPage,
    lastPage,
    selected: selected.filter((id) => items.some((item) => item.id === id)),
    setSelected,
    visible,
    setVisible,
    columns
  }
}
export function NativeListTools<T extends { id: string }>({
  list,
  sortLabels,
  selection = true,
  children
}: {
  list: ReturnType<typeof useNativeList<T>>
  sortLabels: Record<string, string>
  selection?: boolean
  children?: ReactNode
}) {
  const { localization } = useAuthPlugin(organizationPlugin)
  const [columnsOpen, setColumnsOpen] = useState(false)
  return (
    <Box className="gap-3">
      <Select
        selectedKey={list.sort}
        onSelectionChange={list.setSort}
        options={Object.entries(sortLabels).map(([id, label]) => ({
          key: id,
          label
        }))}
      />
      <Button variant="secondary" onPress={() => setColumnsOpen(true)}>
        {localization.columns}
      </Button>
      <Menu isOpen={columnsOpen} onOpenChange={setColumnsOpen}>
        {Object.entries(list.columns).map(([id, label]) => (
          <Checkbox
            key={id}
            isSelected={list.visible.includes(id)}
            onChange={(checked) =>
              list.setVisible(
                checked
                  ? [...list.visible, id]
                  : list.visible.filter((value) => value !== id)
              )
            }
          >
            {label}
          </Checkbox>
        ))}
      </Menu>
      {selection ? (
        <Checkbox
          isSelected={
            list.rows.length > 0 &&
            list.rows.every((row) => list.selected.includes(row.id))
          }
          onChange={(checked) =>
            list.setSelected(
              checked
                ? [
                    ...new Set([
                      ...list.selected,
                      ...list.rows.map((row) => row.id)
                    ])
                  ]
                : list.selected.filter(
                    (id) => !list.rows.some((row) => row.id === id)
                  )
            )
          }
        >
          {localization.selectAllRows}
        </Checkbox>
      ) : null}
      {list.selected.length ? (
        <Txt>
          {localization.selectedCount.replace(
            "{{count}}",
            String(list.selected.length)
          )}
        </Txt>
      ) : null}
      {children}
    </Box>
  )
}
export function NativeListPagination({
  page,
  lastPage,
  onPage
}: {
  page: number
  lastPage: number
  onPage: (page: number) => void
}) {
  const { localization } = useAuthPlugin(organizationPlugin)
  return (
    <Box className="flex-row items-center gap-3">
      <Button
        variant="secondary"
        isDisabled={page === 0}
        onPress={() => onPage(page - 1)}
      >
        {localization.previousPage}
      </Button>
      <Txt>
        {page + 1} / {lastPage + 1}
      </Txt>
      <Button
        variant="secondary"
        isDisabled={page === lastPage}
        onPress={() => onPage(page + 1)}
      >
        {localization.nextPage}
      </Button>
    </Box>
  )
}
