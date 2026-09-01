"use client"

import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import type { MouseEvent } from "react"

import { Checkbox } from "@/components/ui/checkbox"

type SelectableRow = {
  getCanSelect: () => boolean
  getIsSelected: () => boolean
  getToggleSelectedHandler: () => (event: {
    nativeEvent: MouseEvent<HTMLButtonElement>["nativeEvent"]
    shiftKey: boolean
    target: { checked: boolean }
  }) => void
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
    <Checkbox
      aria-label={localization.selectAllRows}
      aria-checked={someSelected && !allSelected ? "mixed" : allSelected}
      checked={allSelected}
      disabled={disabled}
      onCheckedChange={(checked) => onCheckedChange(checked === true)}
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

  function toggle(event: MouseEvent<HTMLElement>) {
    row.getToggleSelectedHandler()({
      nativeEvent: event.nativeEvent,
      shiftKey: event.shiftKey,
      target: { checked: !selected }
    })
  }

  return (
    <Checkbox
      aria-label={localization.selectRow}
      checked={selected}
      disabled={disabled || !row.getCanSelect()}
      onClick={toggle}
    />
  )
}
