import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"

import { Button } from "@/components/ui/button"

type PaginationLocalization = Pick<
  OrganizationLocalization,
  "nextPage" | "paginationRange" | "previousPage"
>

export function OrganizationTablePagination(props: {
  canNextPage: boolean
  canPreviousPage: boolean
  disabled?: boolean
  localization: PaginationLocalization
  onNextPage: () => void
  onPreviousPage: () => void
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
      class="flex items-center justify-between gap-3"
      hidden={props.rowCount <= props.pageSize}
    >
      <p class="text-muted-foreground text-sm tabular-nums">
        {props.localization.paginationRange
          .replace("{{from}}", String(from()))
          .replace("{{to}}", String(to()))
          .replace("{{total}}", String(props.rowCount))}
      </p>

      <div class="flex gap-2">
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
      </div>
    </div>
  )
}
