"use client"

import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { type Row, type RowData, Subscribe } from "@tanstack/react-table"
import type { MouseEvent } from "react"

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
      aria-label={localization.selectAllRows}
      aria-checked={someSelected && !allSelected ? "mixed" : allSelected}
      checked={allSelected}
      disabled={disabled}
      onCheckedChange={(checked) => onCheckedChange(checked === true)}
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
          aria-label={localization.selectRow}
          checked={selected}
          disabled={disabled || !row.getCanSelect()}
          onClick={(event: MouseEvent<HTMLElement>) =>
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
