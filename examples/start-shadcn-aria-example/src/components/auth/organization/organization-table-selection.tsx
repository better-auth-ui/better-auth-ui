"use client"
import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { type Row, type RowData, Subscribe } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import type { organizationTableFeatures } from "./organization-table"
export type OrganizationSelectableRow<TData extends RowData> = Row<
  typeof organizationTableFeatures,
  TData
>
export function OrganizationTableSelectAll({
  allSelected,
  disabled,
  onCheckedChange,
  someSelected,
  localization
}: {
  allSelected: boolean
  disabled?: boolean
  onCheckedChange: (checked: boolean) => void
  someSelected: boolean
  localization: OrganizationLocalization
}) {
  return (
    <Checkbox
      slot={null}
      aria-label={localization.selectAllRows}
      isIndeterminate={someSelected && !allSelected}
      isSelected={allSelected}
      isDisabled={disabled}
      onChange={(checked) => onCheckedChange(checked === true)}
    />
  )
}
export function OrganizationTableSelectRow<TData extends RowData>({
  disabled,
  localization,
  row
}: {
  disabled?: boolean
  localization: OrganizationLocalization
  row: OrganizationSelectableRow<TData>
}) {
  return (
    <Subscribe
      source={row.table.atoms.rowSelection}
      selector={(selection) => selection[row.id] === true}
    >
      {(selected) => (
        <Checkbox
          slot={null}
          aria-label={localization.selectRow}
          isSelected={selected}
          isDisabled={disabled || !row.getCanSelect()}
          onClick={(event) =>
            row.getToggleSelectedHandler()({
              nativeEvent: event.nativeEvent,
              shiftKey: event.shiftKey,
              target: { checked: !selected }
            })
          }
        />
      )}
    </Subscribe>
  )
}
