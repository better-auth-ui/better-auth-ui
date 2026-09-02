import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { Checkbox } from "@/components/ui/checkbox"

export type OrganizationSelectableRow = {
  getCanSelect: () => boolean
  getIsSelected: () => boolean
  getToggleSelectedHandler: () => (event: {
    shiftKey: boolean
    target: { checked: boolean }
  }) => void
}

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

export function OrganizationTableSelectRow(props: {
  disabled?: boolean
  localization: Pick<OrganizationLocalization, "selectRow">
  row: OrganizationSelectableRow
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
      onKeyDown={() => {
        shiftKey = false
      }}
      onPointerDown={(event) => {
        shiftKey = event.shiftKey
      }}
    />
  )
}
