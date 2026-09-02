import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { Checkbox } from "@heroui/react"
import { type Row, type RowData, Subscribe } from "@tanstack/react-table"
import { useRef } from "react"
import type { organizationTableFeatures } from "./organization-table"

export type OrganizationSelectableRow<TData extends RowData> = Row<
  typeof organizationTableFeatures,
  TData
>

function SelectionCheckbox({
  ariaLabel,
  disabled,
  selected,
  indeterminate,
  onChange
}: {
  ariaLabel: string
  disabled?: boolean
  selected: boolean
  indeterminate?: boolean
  onChange: (selected: boolean, shiftKey: boolean) => void
}) {
  const shiftKey = useRef(false)

  return (
    <Checkbox
      aria-label={ariaLabel}
      isDisabled={disabled}
      isIndeterminate={indeterminate}
      isSelected={selected}
      onChange={(next) => {
        onChange(next, shiftKey.current)
        shiftKey.current = false
      }}
      onKeyDown={(event) => {
        shiftKey.current = event.shiftKey
      }}
      onPointerDown={(event) => {
        shiftKey.current = event.shiftKey
      }}
      slot="selection"
    >
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
      </Checkbox.Content>
    </Checkbox>
  )
}

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
    <SelectionCheckbox
      ariaLabel={localization.selectAllRows}
      disabled={disabled}
      indeterminate={someSelected && !allSelected}
      selected={allSelected}
      onChange={onCheckedChange}
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
        <SelectionCheckbox
          ariaLabel={localization.selectRow}
          disabled={disabled || !row.getCanSelect()}
          selected={selected}
          onChange={(next, shiftKey) =>
            row.getToggleSelectedHandler()({
              shiftKey,
              target: { checked: next }
            })
          }
        />
      )}
    </Subscribe>
  )
}
