import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { Gear } from "@gravity-ui/icons"
import { Button, Dropdown, Label } from "@heroui/react"

export type OrganizationTableViewColumn = {
  id: string
  label: string
  visible: boolean
  onVisibleChange: (visible: boolean) => void
}

export function OrganizationTableViewOptions({
  columns,
  disabled,
  localization
}: {
  columns: OrganizationTableViewColumn[]
  disabled?: boolean
  localization: OrganizationLocalization
}) {
  return (
    <Dropdown>
      <Button size="sm" variant="secondary" isDisabled={disabled}>
        <Gear />
        {localization.columns}
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          selectionMode="multiple"
          selectedKeys={
            new Set(
              columns
                .filter((column) => column.visible)
                .map((column) => column.id)
            )
          }
          onSelectionChange={(keys) => {
            const visible =
              keys === "all"
                ? new Set(columns.map((column) => column.id))
                : new Set(keys)
            for (const column of columns)
              column.onVisibleChange(visible.has(column.id))
          }}
        >
          {columns.map((column) => (
            <Dropdown.Item
              id={column.id}
              key={column.id}
              textValue={column.label}
            >
              <Label>{column.label}</Label>
              <Dropdown.ItemIndicator />
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
