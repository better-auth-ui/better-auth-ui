import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import type { Row, RowData } from "@tanstack/solid-table"
import { Checkbox } from "@/components/ui/checkbox"
import type { organizationTableFeatures } from "./organization-table"

export type OrganizationSelectableRow<TData extends RowData = RowData> = Pick<
  Row<typeof organizationTableFeatures, TData>,
  "getCanSelect" | "getIsSelected" | "getToggleSelectedHandler"
>

export function OrganizationTableSelectAll(props: {
  allSelected: boolean
  disabled?: boolean
  localization: Pick<OrganizationLocalization, "selectAllRows">
  onCheckedChange: (checked: boolean) => void
  someSelected: boolean
}) {
  return (
    <Checkbox
      aria-label={props.localization.selectAllRows}
      checked={props.allSelected}
      disabled={props.disabled}
      indeterminate={props.someSelected && !props.allSelected}
      onChange={props.onCheckedChange}
    />
  )
}

export function OrganizationTableSelectRow<TData extends RowData>(props: {
  disabled?: boolean
  localization: Pick<OrganizationLocalization, "selectRow">
  row: OrganizationSelectableRow<TData>
}) {
  let shiftKey = false

  return (
    <Checkbox
      aria-label={props.localization.selectRow}
      checked={props.row.getIsSelected()}
      disabled={props.disabled || !props.row.getCanSelect()}
      onChange={(checked) => {
        props.row.getToggleSelectedHandler()({
          shiftKey,
          target: { checked }
        })
        shiftKey = false
      }}
      onKeyDown={(event) => {
        shiftKey = event.shiftKey
      }}
      onPointerDown={(event) => {
        shiftKey = event.shiftKey
      }}
    />
  )
}
