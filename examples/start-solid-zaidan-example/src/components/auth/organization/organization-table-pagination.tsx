import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { For } from "solid-js"
import { Button } from "@/components/ui/button"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { ORGANIZATION_TABLE_PAGE_SIZE_OPTIONS } from "./organization-table-state"

type PaginationLocalization = Pick<
  OrganizationLocalization,
  | "firstPage"
  | "lastPage"
  | "nextPage"
  | "pageOf"
  | "paginationRange"
  | "previousPage"
  | "rowsPerPage"
>

export function OrganizationTablePagination(props: {
  canNextPage: boolean
  canPreviousPage: boolean
  disabled?: boolean
  localization: PaginationLocalization
  onFirstPage: () => void
  onLastPage: () => void
  onNextPage: () => void
  onPageSizeChange: (size: number) => void
  onPreviousPage: () => void
  pageCount: number
  pageIndex: number
  pageSize: number
  rowCount: number
  visibleRowCount: number
}) {
  const pageStart = () => props.pageIndex * props.pageSize
  const from = () => pageStart() + 1
  const to = () => Math.min(pageStart() + props.visibleRowCount, props.rowCount)
  return (
    <div
      class="flex flex-wrap items-center justify-between gap-3"
      hidden={!props.rowCount}
    >
      <p class="text-muted-foreground text-sm tabular-nums">
        {props.localization.paginationRange
          .replace("{{from}}", String(from()))
          .replace("{{to}}", String(to()))
          .replace("{{total}}", String(props.rowCount))}
      </p>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <span class="flex items-center gap-2 text-sm text-muted-foreground">
          {props.localization.rowsPerPage}
          <NativeSelect
            aria-label={props.localization.rowsPerPage}
            disabled={props.disabled}
            size="sm"
            value={String(props.pageSize)}
            onChange={(event) =>
              props.onPageSizeChange(Number(event.currentTarget.value))
            }
          >
            <For
              each={Array.from(
                new Set([
                  ...ORGANIZATION_TABLE_PAGE_SIZE_OPTIONS,
                  props.pageSize
                ])
              ).sort((left, right) => left - right)}
            >
              {(size) => (
                <NativeSelectOption value={String(size)}>
                  {size}
                </NativeSelectOption>
              )}
            </For>
          </NativeSelect>
        </span>
        <span class="min-w-20 text-center text-sm text-muted-foreground tabular-nums">
          {props.localization.pageOf
            .replace("{{page}}", String(props.pageIndex + 1))
            .replace("{{pages}}", String(Math.max(props.pageCount, 1)))}
        </span>
        <Button
          disabled={props.disabled || !props.canPreviousPage}
          onClick={props.onFirstPage}
          size="sm"
          type="button"
          variant="outline"
        >
          {props.localization.firstPage}
        </Button>
        <Button
          disabled={props.disabled || !props.canPreviousPage}
          onClick={props.onPreviousPage}
          size="sm"
          type="button"
          variant="outline"
        >
          {props.localization.previousPage}
        </Button>
        <Button
          disabled={props.disabled || !props.canNextPage}
          onClick={props.onNextPage}
          size="sm"
          type="button"
          variant="outline"
        >
          {props.localization.nextPage}
        </Button>
        <Button
          disabled={props.disabled || !props.canNextPage}
          onClick={props.onLastPage}
          size="sm"
          type="button"
          variant="outline"
        >
          {props.localization.lastPage}
        </Button>
      </div>
    </div>
  )
}
