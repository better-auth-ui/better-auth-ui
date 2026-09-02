import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { Checkbox } from "@heroui/react"
import { useRef } from "react"

type SelectableRow = {
  getCanSelect: () => boolean
  getIsSelected: () => boolean
  getToggleSelectedHandler: () => (event: {
    shiftKey: boolean
    target: { checked: boolean }
  }) => void
}

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

export function OrganizationTableSelectRow({
  disabled,
  localization,
  row
}: {
  disabled?: boolean
  localization: OrganizationLocalization
  row: SelectableRow
}) {
  const selected = row.getIsSelected()
  return (
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
  )
}
